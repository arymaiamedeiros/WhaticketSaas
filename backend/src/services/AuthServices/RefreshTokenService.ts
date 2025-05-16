import { verify } from "jsonwebtoken";
import { Response as Res } from "express";

import User from "../../models/User";
import AppError from "../../errors/AppError";
import ShowUserService from "../UserServices/ShowUserService";
import authConfig from "../../config/auth";
import {
  createAccessToken,
  createRefreshToken
} from "../../helpers/CreateTokens";
import { logger } from "../../utils/logger";

interface RefreshTokenPayload {
  id: string;
  tokenVersion: number;
  companyId: number;
}

interface Response {
  user: User;
  newToken: string;
  refreshToken: string;
}

export const RefreshTokenService = async (
  res: Res,
  token: string
): Promise<Response> => {
  try {
    if (!token) {
      logger.warn("RefreshTokenService: Token não fornecido");
      res.clearCookie("jrt", {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/'
      });
      throw new AppError("ERR_SESSION_EXPIRED", 401);
    }
    
    logger.info(`RefreshTokenService: Tentando verificar token: ${token.substring(0, 15)}...`);
    
    const decoded = verify(token, authConfig.refreshSecret);
    const { id, tokenVersion, companyId } = decoded as RefreshTokenPayload;

    logger.info(`RefreshTokenService: Token verificado para userId: ${id}`);
    
    const user = await ShowUserService(id);

    if (!user) {
      logger.warn(`RefreshTokenService: Usuário não encontrado: ${id}`);
      res.clearCookie("jrt", {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/'
      });
      throw new AppError("ERR_SESSION_EXPIRED", 401);
    }

    logger.info(`RefreshTokenService: Usuário encontrado: ${user.name}, tokenVersion: ${user.tokenVersion}, esperado: ${tokenVersion}`);

    if (user.tokenVersion !== tokenVersion) {
      logger.warn(`RefreshTokenService: Versão do token inválida. Esperado ${user.tokenVersion}, Recebido: ${tokenVersion}`);
      res.clearCookie("jrt", {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/'
      });
      throw new AppError("ERR_SESSION_EXPIRED", 401);
    }

    const newToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    logger.info(`RefreshTokenService: Token renovado com sucesso para userId: ${id}`);
    
    return { user, newToken, refreshToken };
  } catch (err) {
    logger.error(`RefreshTokenService: Erro ao renovar token: ${err.message}`);
    res.clearCookie("jrt", {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/'
    });
    throw new AppError("ERR_SESSION_EXPIRED", 401);
  }
};
