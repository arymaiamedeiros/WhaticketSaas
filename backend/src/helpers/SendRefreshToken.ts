import { Response } from "express";

export const SendRefreshToken = (res: Response, token: string): void => {
  res.cookie("jrt", token, { 
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? 'none' : 'lax',
    path: '/',
    maxAge: 14 * 24 * 60 * 60 * 1000
  });
  
  console.log("Cookie de refresh token definido com sucesso");
};
