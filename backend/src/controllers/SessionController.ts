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
  const token: string = req.cookies.jrt;

  if (!token) {
    throw new AppError("ERR_SESSION_EXPIRED", 401);
  }

  const { user, newToken, refreshToken } = await RefreshTokenService(
    res,
    token
  );

  SendRefreshToken(res, refreshToken);

  return res.json({ token: newToken, user });
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
  try {
    // Se houver um usuário autenticado, atualiza o status online
    if (req.user?.id) {
      const user = await User.findByPk(req.user.id);
      if (user) {
        await user.update({ online: false });
      }
    }

    // Limpa o cookie de refresh token
    res.clearCookie("jrt", {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });

    return res.send();
  } catch (error) {
    // Em caso de erro, apenas limpa o cookie e retorna
    res.clearCookie("jrt", {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });
    return res.send();
  }
};
