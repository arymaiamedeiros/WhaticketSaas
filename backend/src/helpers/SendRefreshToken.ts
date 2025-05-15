import { Response } from "express";

export const SendRefreshToken = (res: Response, token: string): void => {
  res.cookie("jrt", token, { 
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  });
};
