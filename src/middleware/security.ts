import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import { expressCspHeader, INLINE, NONE, SELF } from 'express-csp-header';
import { sanitize } from 'express-mongo-sanitize';
import hpp from 'hpp';

// Rate limiting
export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite por IP
  message: 'Muitas requisições deste IP, tente novamente em 15 minutos'
});

// Configuração do Helmet
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://api.whaticket.com'],
      fontSrc: ["'self'", 'https:', 'data:'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  dnsPrefetchControl: true,
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: true,
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true
});

// Configuração do CORS
export const corsOptions = {
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 600
};

// Middleware de sanitização de entrada
export const sanitizeInput = (req: Request, _res: Response, next: NextFunction) => {
  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);
  next();
};

// Middleware de validação de entrada
export const validateInput = (req: Request, res: Response, next: NextFunction) => {
  const invalidChars = /[<>{}]/;
  
  const hasInvalidChar = (obj: any): boolean => {
    for (let key in obj) {
      if (typeof obj[key] === 'string' && invalidChars.test(obj[key])) {
        return true;
      }
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        if (hasInvalidChar(obj[key])) return true;
      }
    }
    return false;
  };

  if (
    hasInvalidChar(req.body) ||
    hasInvalidChar(req.query) ||
    hasInvalidChar(req.params)
  ) {
    return res.status(400).json({ error: 'Caracteres inválidos detectados' });
  }

  next();
};

// Middleware de prevenção de ataques de poluição de parâmetros HTTP
export const preventHPP = hpp();

// Middleware de segurança para uploads de arquivos
export const validateFileUpload = (req: Request, res: Response, next: NextFunction) => {
  if (!req.files) return next();

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  const files = Array.isArray(req.files) ? req.files : [req.files];

  for (const file of files) {
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({ error: 'Tipo de arquivo não permitido' });
    }
    if (file.size > maxSize) {
      return res.status(400).json({ error: 'Arquivo muito grande' });
    }
  }

  next();
};

// Middleware de validação de token JWT
export const validateJWT = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    return res.status(401).json({ error: 'Token inválido' });
  }
}; 