import { Request, Response } from "express";
import express from "express";
import * as Yup from "yup";
import Gerencianet from "gn-api-sdk-typescript";
import AppError from "../errors/AppError";

import options from "../config/Gn";
import Company from "../models/Company";
import Invoices from "../models/Invoices";
import Subscriptions from "../models/Subscriptions";
import { getIO } from "../libs/socket";
import UpdateUserService from "../services/UserServices/UpdateUserService";

const app = express();


export const index = async (req: Request, res: Response): Promise<Response> => {
  const gerencianet = Gerencianet(options);
  return res.json(gerencianet.getSubscriptions());
};

export const createSubscription = async (
  req: Request,
  res: Response
  ): Promise<Response> => {
    const gerencianet = Gerencianet(options);
    const { companyId } = req.user;

  const schema = Yup.object().shape({
    firstName: Yup.string().required("Nome completo é obrigatório"),
    price: Yup.number().required("Preço é obrigatório").typeError("Preço deve ser um número"),
    users: Yup.number().required("Número de usuários é obrigatório").typeError("Número de usuários deve ser um número"),
    connections: Yup.number().required("Número de conexões é obrigatório").typeError("Número de conexões deve ser um número"),
    plan: Yup.string().required("Plano é obrigatório"),
    invoiceId: Yup.number().required("ID da fatura é obrigatório").typeError("ID da fatura deve ser um número")
  });

  try {
    await schema.validate(req.body, { abortEarly: false });
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      const errors = error.inner.map(err => ({
        field: err.path,
        message: err.message
      }));
      throw new AppError(`Validation fails: ${JSON.stringify(errors)}`, 400);
    }
    throw new AppError("Validation fails", 400);
  }

  const {
    firstName,
    price,
    users,
    connections,
    address2,
    city,
    state,
    zipcode,
    country,
    plan,
    invoiceId
  } = req.body;
  
  let formattedPrice = price;
  // Se o valor for uma string, converte para número
  if (typeof price === 'string') {
    formattedPrice = parseFloat(price);
  }

  if (isNaN(formattedPrice) || formattedPrice <= 0) {
    throw new AppError("Preço inválido", 400);
  }

  // Verificar se o valor da chave PIX está configurado
  if (!process.env.GERENCIANET_PIX_KEY) {
    throw new AppError("Chave PIX não configurada no servidor", 500);
  }

  const body = {
    calendario: {
      expiracao: 3600
    },
    valor: {
      original: formattedPrice.toLocaleString("pt-br", { minimumFractionDigits: 2 }).replace(",", ".")
    },
    chave: process.env.GERENCIANET_PIX_KEY,
    solicitacaoPagador: `#Fatura:${invoiceId}`
    };
  try {
    const pix = await gerencianet.pixCreateImmediateCharge(null, body);

    const qrcode = await gerencianet.pixGenerateQRCode({
      id: pix.loc.id
    });

    const updateCompany = await Company.findOne();

    if (!updateCompany) {
      throw new AppError("Company not found", 404);
    }


/*     await Subscriptions.create({
      companyId,
      isActive: false,
      userPriceCents: users,
      whatsPriceCents: connections,
      lastInvoiceUrl: pix.location,
      lastPlanChange: new Date(),
      providerSubscriptionId: pix.loc.id,
      expiresAt: new Date()
    }); */

/*     const { id } = req.user;
    const userData = {};
    const userId = id;
    const requestUserId = parseInt(id);
    const user = await UpdateUserService({ userData, userId, companyId, requestUserId }); */

    /*     const io = getIO();
        io.emit("user", {
          action: "update",
          user
        }); */


    return res.json({
      ...pix,
      qrcode,

    });
  } catch (error) {
    console.error("Error in subscription creation:", error);
    
    // Verificar se é um erro da API Gerencianet e fornecer mensagem mais específica
    if (error.response && error.response.data) {
      throw new AppError(`Erro na criação do pagamento: ${error.response.data.message || JSON.stringify(error.response.data)}`, 400);
    }
    
    throw new AppError("Erro na criação da assinatura. Por favor, tente novamente.", 400);
  }
};

export const createWebhook = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const schema = Yup.object().shape({
    chave: Yup.string().required(),
    url: Yup.string().required()
  });

  if (!(await schema.isValid(req.body))) {
    throw new AppError("Validation fails", 400);
  }

  const { chave, url } = req.body;

  const body = {
    webhookUrl: url
  };

  const params = {
    chave
  };

  try {
    const gerencianet = Gerencianet(options);
    console.log("Attempting to configure Gerencianet webhook with params:", params, "and body:", body);
    const create = await gerencianet.pixConfigWebhook(params, body);
    console.log("Gerencianet webhook configured successfully:", create);
    return res.json(create);
  } catch (error) {
    console.error("Error creating webhook:", error);
    if (error.response && error.response.data) {
      // Handle Gerencianet API errors
      return res.status(error.response.status || 500).json({
        error: error.response.data.mensagem || error.response.data.message || "Erro na API Gerencianet",
        details: error.response.data
      });
    } else if (error instanceof AppError) {
      // Handle application-specific errors
      return res.status(error.statusCode).json({ error: error.message });
    } else {
      // Handle unexpected errors
      return res.status(500).json({ error: "Erro interno ao configurar o webhook." });
    }
  }
};

export const webhook = async (
  req: Request,
  res: Response
  ): Promise<Response> => {
  const { type } = req.params;
  const { evento } = req.body;
  if (evento === "teste_webhook") {
    return res.json({ ok: true });
  }
  if (req.body.pix) {
    const gerencianet = Gerencianet(options);
    req.body.pix.forEach(async (pix: any) => {
      const detahe = await gerencianet.pixDetailCharge({
        txid: pix.txid
      });

      if (detahe.status === "CONCLUIDA") {
        const { solicitacaoPagador } = detahe;
        const invoiceID = solicitacaoPagador.replace("#Fatura:", "");
        const invoices = await Invoices.findByPk(invoiceID);
        const companyId =invoices.companyId;
        const company = await Company.findByPk(companyId);

        const expiresAt = new Date(company.dueDate);
        expiresAt.setDate(expiresAt.getDate() + 30);
        const date = expiresAt.toISOString().split("T")[0];

        if (company) {
          await company.update({
            dueDate: date
          });
         const invoi = await invoices.update({
            id: invoiceID,
            status: 'paid'
          });
          await company.reload();
          const io = getIO();
          const companyUpdate = await Company.findOne({
            where: {
              id: companyId
            }
          });

          io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-payment`, {
            action: detahe.status,
            company: companyUpdate
          });
        }

      }
    });

  }

  return res.json({ ok: true });
};
