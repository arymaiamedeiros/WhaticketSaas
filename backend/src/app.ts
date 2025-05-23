import * as Sentry from "@sentry/node";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import "express-async-errors";
import "reflect-metadata";
import "./bootstrap";

import bodyParser from 'body-parser';
import uploadConfig from "./config/upload";
import "./database";
import AppError from "./errors/AppError";
import { messageQueue, sendScheduledMessages } from "./queues";
import routes from "./routes";
import { logger } from "./utils/logger";

Sentry.init({ dsn: process.env.SENTRY_DSN });

const app = express();

app.set("queues", {
  messageQueue,
  sendScheduledMessages
});

const bodyparser = require('body-parser');
app.use(bodyParser.json({ limit: '10mb' }));

// Configuração CORS mais permissiva
app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_URL || true, // Usa FRONTEND_URL ou permite qualquer origem
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'Access-Control-Allow-Origin', 'Access-Control-Allow-Headers', 'Access-Control-Allow-Credentials'],
    exposedHeaders: ['Access-Control-Allow-Origin', 'Access-Control-Allow-Credentials']
  })
);

// Middleware para adicionar cabeçalhos CORS a todas as respostas
app.use((req, res, next) => {
  // Usar a origem da requisição ou o valor do FRONTEND_URL
  const origin = req.headers.origin || process.env.FRONTEND_URL;
  
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  // Importante: permitir cookies/credenciais
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD');
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  
  // Lidar com solicitações preflight OPTIONS
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
});

app.use(cookieParser());
app.use(express.json());
app.use(Sentry.Handlers.requestHandler());
app.use("/public", express.static(uploadConfig.directory));
app.use(routes);

app.use(Sentry.Handlers.errorHandler());

app.use(async (err: Error, req: Request, res: Response, _: NextFunction) => {
  if (err instanceof AppError) {
    logger.warn(err);
    return res.status(err.statusCode).json({ error: err.message });
  }

  logger.error(err);
  return res.status(500).json({ error: "Internal server error" });
});

export default app;
