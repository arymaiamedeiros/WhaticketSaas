import { Request, Response } from "express";
import AppError from "../errors/AppError";
import { getIO } from "../libs/socket";

import AuthUserService from "../services/UserServices/AuthUserService";
import { SendRefreshToken } from "../helpers/SendRefreshToken";
import { RefreshTokenService } from "../services/AuthServices/RefreshTokenService";
import FindUserFromToken from "../services/AuthServices/FindUserFromToken";
import User from "../models/User";

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { email, password } = req.body;

  const { token, serializedUser, refreshToken } = await AuthUserService({
    email,
    password
  });

  SendRefreshToken(res, refreshToken);

  const io = getIO();
  io.to(`user-${serializedUser.id}`).emit(`company-${serializedUser.companyId}-auth`, {
    action: "update",
    user: {
      id: serializedUser.id,
      email: serializedUser.email,
      companyId: serializedUser.companyId
    }
  });

  return res.status(200).json({
    token,
    user: serializedUser
  });
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const tokenFromCookie: string = req.cookies.jrt;
  
  // Adiciona logging para diagnóstico
  console.log("Tentativa de refresh token");
  console.log("Cookie recebido:", tokenFromCookie ? "Sim" : "Não");
  
  // Tenta obter o token do cookie ou do body da requisição
  // Isso ajuda com clientes que não conseguem enviar cookies
  const token = tokenFromCookie || req.body.refresh_token;

  if (!token) {
    console.log("Nenhum token encontrado (cookie ou body)");
    throw new AppError("ERR_SESSION_EXPIRED", 401);
  }

  try {
    const { user, newToken, refreshToken } = await RefreshTokenService(
      res,
      token
    );

    // Define o cookie de refresh token
    SendRefreshToken(res, refreshToken);
    
    console.log(`Refresh token bem-sucedido para o usuário: ${user.id}`);

    return res.json({ token: newToken, user });
  } catch (error) {
    console.error("Erro no refresh token:", error.message);
    throw new AppError("ERR_SESSION_EXPIRED", 401);
  }
};

export const me = async (req: Request, res: Response): Promise<Response> => {
  const token: string = req.cookies.jrt;
  const user = await FindUserFromToken(token);
  const { id, profile, super: superAdmin } = user;

  if (!token) {
    throw new AppError("ERR_SESSION_EXPIRED", 401);
  }

  return res.json({ id, profile, super: superAdmin });
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  console.log("Iniciando processo de logout para usuário:", req.user?.id);
  
  try {
    // Se houver um usuário autenticado, atualiza o status online
    if (req.user?.id) {
      try {
        const user = await User.findByPk(req.user.id);
        if (user) {
          await user.update({ online: false });
          console.log(`Usuário ${req.user.id} marcado como offline`);
          
          // Emite evento via socket para notificar a mudança de status
          const io = getIO();
          io.to(`company-${user.companyId}-auth`).emit("user-status", {
            userId: user.id,
            online: false
          });
        }
      } catch (userError) {
        console.error("Erro ao atualizar status do usuário:", userError);
        // Continua o processo mesmo com erro
      }
    }

    // Obtém a origem da requisição para definir o cabeçalho correto
    const origin = req.headers.origin || process.env.FRONTEND_URL;
    if (origin) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Credentials', 'true');
    }

    // Limpa o cookie de refresh token com opções mais flexíveis para cross-browser
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", 
      sameSite: process.env.NODE_ENV === "production" ? 'none' as const : 'lax' as const,
      path: '/'
    };
    
    // Tenta várias abordagens para garantir que o cookie seja eliminado
    res.clearCookie("jrt", cookieOptions);
    // Também define o cookie com expiração no passado como backup
    res.cookie("jrt", "", { 
      ...cookieOptions,
      expires: new Date(0)
    });
    
    console.log("Logout concluído com sucesso");
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Erro durante logout:", error);
    // Em caso de erro, tenta limpar o cookie e retorna um erro amigável
    try {
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? 'none' as const : 'lax' as const,
        path: '/'
      };
      
      res.clearCookie("jrt", cookieOptions);
      res.cookie("jrt", "", { 
        ...cookieOptions,
        expires: new Date(0)
      });
    } catch (cookieError) {
      console.error("Erro ao limpar cookie:", cookieError);
    }
    
    // Mesmo com erro, retorna sucesso para o frontend, pois o logout local já aconteceu
    return res.status(200).json({ message: "Logout processed with server warnings" });
  }
};
