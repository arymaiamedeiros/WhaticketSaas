# Documento Técnico: Correções no Sistema de Autenticação do WhaTicket

## Índice
1. [Descrição do Problema](#descrição-do-problema)
2. [Análise Técnica](#análise-técnica)
3. [Correções Implementadas](#correções-implementadas)
   - [Frontend](#frontend)
   - [Backend](#backend)
4. [Impacto das Alterações](#impacto-das-alterações)
5. [Procedimento de Implantação](#procedimento-de-implantação)
6. [Testes de Verificação](#testes-de-verificação)
7. [Recomendações Futuras](#recomendações-futuras)
8. [Glossário](#glossário)

## Descrição do Problema

O sistema WhaTicket apresentava um comportamento errático de autenticação, especificamente:
- Tokens expirando rapidamente (15 minutos)
- Usuários sendo constantemente redirecionados para a tela de login
- Erro "Expired token, redirecting to login" nos logs do navegador
- Perda de sessão ao tentar acessar diferentes funcionalidades
- Falhas na conexão WebSocket devido a problemas de autenticação

Este comportamento resultava em uma experiência de usuário deficiente e interrupções frequentes de trabalho.

## Análise Técnica

Após análise abrangente do código-fonte, identificamos as seguintes causas-raiz:

1. **Configuração de tokens inadequada**:
   - Token de acesso com expiração muito curta (15 minutos)
   - Refresh token com configuração de cookie potencialmente incompatível com CORS

2. **Falta de mecanismos de refresh automático**:
   - Sistema não tentava renovar tokens expirados antes de redirecionar para login
   - Ausência de interceptor para tratar automaticamente erros 401/403

3. **Problemas de compatibilidade CORS**:
   - Configurações inconsistentes de cabeçalhos CORS
   - Problemas com cookies em requisições cross-origin

4. **Ausência de logs detalhados**:
   - Falta de informações de diagnóstico nos serviços de autenticação

## Correções Implementadas

### Frontend

#### 1. Arquivo: `frontend/src/context/Socket/SocketContext.js`

**Problema**: Ao detectar token expirado, redirecionava imediatamente para login.

**Solução**: Implementamos refresh automático de token antes de redirecionar:

```javascript
// Antes
if (isExpired(token)) {
  console.warn("Expired token, redirecting to login");
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  window.location.href = "/login";
  return new DummySocket();
}

// Depois
if (isExpired(token)) {
  try {
    const apiBase = process.env.REACT_APP_BACKEND_URL || "";
    fetch(`${apiBase}/auth/refresh_token`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    })
    .then(response => {
      if (response.ok) return response.json();
      throw new Error('Falha ao renovar token');
    })
    .then(data => {
      if (data && data.token) {
        localStorage.setItem("token", JSON.stringify(data.token));
        window.location.reload();
      } else {
        console.warn("Token expirado e não foi possível renovar");
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        window.location.href = "/login";
      }
    })
    .catch(error => {
      // Tratamento de erro e redirecionamento somente se necessário
      console.error("Erro ao renovar token:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      window.location.href = "/login";
    });
    return new DummySocket();
  } catch (error) {
    console.warn("Erro ao tentar renovar token expirado:", error);
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    window.location.href = "/login";
    return new DummySocket();
  }
}
```

#### 2. Arquivo: `frontend/src/hooks/useAuth.js/index.js`

**Problema**: Processo de refresh de token não garantia envio correto de cookies e não tinha tratamento robusto de erros.

**Solução**: Melhoramos o processo de refresh com suporte adequado a cookies e tratamento de falhas de conexão:

```javascript
// Antes
try {
  console.log("Tentando refresh de token na inicialização...");
  const { data } = await api.post("/auth/refresh_token");
  api.defaults.headers.Authorization = `Bearer ${data.token}`;
  localStorage.setItem("token", JSON.stringify(data.token));
  setIsAuth(true);
  setUser(data.user);
  console.log("Refresh de token bem-sucedido!");
} catch (err) {
  // Tratamento de erro básico
}

// Depois
try {
  console.log("Tentando refresh de token na inicialização...");
  const { data } = await api.post("/auth/refresh_token", {}, {
    // Garantir que cookies são enviados
    withCredentials: true
  });
  
  // Verifica se temos um token válido na resposta
  if (data && data.token) {
    api.defaults.headers.Authorization = `Bearer ${data.token}`;
    localStorage.setItem("token", JSON.stringify(data.token));
    setIsAuth(true);
    setUser(data.user);
    console.log("Refresh de token bem-sucedido!");
  } else {
    throw new Error("Refresh token inválido ou expirado");
  }
} catch (err) {
  console.error("Erro ao fazer refresh do token:", err);
  // Tenta novamente uma vez em caso de erro de conexão, após pequena espera
  if (err.message && (err.message.includes('network') || err.message.includes('conexão'))) {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const { data } = await api.post("/auth/refresh_token", {}, {
        withCredentials: true
      });
      if (data && data.token) {
        api.defaults.headers.Authorization = `Bearer ${data.token}`;
        localStorage.setItem("token", JSON.stringify(data.token));
        setIsAuth(true);
        setUser(data.user);
        console.log("Refresh de token bem-sucedido na segunda tentativa!");
        setLoading(false);
        return;
      }
    } catch (retryErr) {
      console.error("Falha na segunda tentativa de refresh do token:", retryErr);
    }
  }
  
  // Tratamento padrão em caso de falha
}
```

#### 3. Arquivo: `frontend/src/services/api.js`

**Problema**: Falta de interceptor para tratar erros de autenticação em requisições HTTP.

**Solução**: Implementamos um sistema completo de interceptadores para renovar tokens automaticamente:

```javascript
// Adicionado: Variáveis e função para controle de refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Melhorado: Interceptor de requisição com tratamento de erro
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const parsedToken = JSON.parse(token);
        config.headers["Authorization"] = `Bearer ${parsedToken}`;
        console.log("Enviando requisição com token:", `Bearer ${parsedToken.substring(0, 15)}...`);
      } catch (error) {
        console.error("Erro ao processar token na requisição:", error);
      }
    }
    return config;
  },
  (error) => {
    console.error("Erro na requisição:", error);
    return Promise.reject(error);
  }
);

// Adicionado: Interceptor de resposta para refresh automático
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Evita loop infinito tentando refresh no endpoint de refresh
    if (error.response?.status === 401 && !originalRequest._retry && 
      !originalRequest.url.includes('/auth/refresh_token')) {
      
      if (isRefreshing) {
        // Se já estiver em processo de refresh, adiciona a requisição à fila
        try {
          const token = await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return api(originalRequest);
        } catch (err) {
          return Promise.reject(err);
        }
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        // Tenta fazer o refresh do token
        const { data } = await api.post("/auth/refresh_token", {}, { _retry: true });
        
        if (data && data.token) {
          localStorage.setItem("token", JSON.stringify(data.token));
          api.defaults.headers.Authorization = `Bearer ${data.token}`;
          originalRequest.headers['Authorization'] = `Bearer ${data.token}`;
          
          // Processa a fila de requisições pendentes
          processQueue(null, data.token);
          return api(originalRequest);
        } else {
          processQueue(new Error('Falha ao renovar token'));
          throw new Error('Falha ao renovar token');
        }
      } catch (refreshError) {
        processQueue(refreshError);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);
```

### Backend

#### 1. Arquivo: `backend/src/config/auth.ts`

**Problema**: Tempo de expiração dos tokens muito curto.

**Solução**: Aumentamos os tempos de expiração:

```typescript
// Antes
export default {
  secret: process.env.JWT_SECRET || "mysecret",
  expiresIn: "15m",
  refreshSecret: process.env.JWT_REFRESH_SECRET || "myanothersecret",
  refreshExpiresIn: "7d"
};

// Depois
export default {
  secret: process.env.JWT_SECRET || "mysecret",
  expiresIn: "1h",  // Aumentado de 15m para 1h
  refreshSecret: process.env.JWT_REFRESH_SECRET || "myanothersecret",
  refreshExpiresIn: "14d"  // Aumentado de 7d para 14d
};
```

#### 2. Arquivo: `backend/src/services/AuthServices/RefreshTokenService.ts`

**Problema**: Falta de logs para diagnóstico de problemas de autenticação.

**Solução**: Adicionamos logs detalhados em pontos estratégicos:

```typescript
// Adicionado: Importação de logger e logs em várias etapas do processo
import { logger } from "../../utils/logger";

// Logs ao verificar token
if (!token) {
  logger.warn("RefreshTokenService: Token não fornecido");
  // ...
}

logger.info(`RefreshTokenService: Tentando verificar token: ${token.substring(0, 15)}...`);

// Log após verificação
logger.info(`RefreshTokenService: Token verificado para userId: ${id}`);

// Log ao validar usuário
if (!user) {
  logger.warn(`RefreshTokenService: Usuário não encontrado: ${id}`);
  // ...
}

logger.info(`RefreshTokenService: Usuário encontrado: ${user.name}, tokenVersion: ${user.tokenVersion}, esperado: ${tokenVersion}`);

// Log ao validar versão do token
if (user.tokenVersion !== tokenVersion) {
  logger.warn(`RefreshTokenService: Versão do token inválida. Esperado ${user.tokenVersion}, Recebido: ${tokenVersion}`);
  // ...
}

// Log de sucesso
logger.info(`RefreshTokenService: Token renovado com sucesso para userId: ${id}`);

// Log de erro
logger.error(`RefreshTokenService: Erro ao renovar token: ${err.message}`);
```

#### 3. Arquivo: `backend/src/controllers/SessionController.ts`

**Problema**: Endpoint de refresh token aceitava token apenas via cookie.

**Solução**: Modificamos para aceitar token via cookie ou corpo da requisição:

```typescript
// Antes
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

// Depois
export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const tokenFromCookie: string = req.cookies.jrt;
  
  // Adiciona logging para diagnóstico
  console.log("Tentativa de refresh token");
  console.log("Cookie recebido:", tokenFromCookie ? "Sim" : "Não");
  
  // Tenta obter o token do cookie ou do body da requisição
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

    SendRefreshToken(res, refreshToken);
    
    console.log(`Refresh token bem-sucedido para o usuário: ${user.id}`);

    return res.json({ token: newToken, user });
  } catch (error) {
    console.error("Erro no refresh token:", error.message);
    throw new AppError("ERR_SESSION_EXPIRED", 401);
  }
};
```

#### 4. Arquivo: `backend/src/helpers/SendRefreshToken.ts`

**Problema**: Configuração de cookies inadequada para ambientes com CORS.

**Solução**: Melhoramos a configuração dos cookies de refresh token:

```typescript
// Antes
export const SendRefreshToken = (res: Response, token: string): void => {
  res.cookie("jrt", token, { 
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/'
  });
};

// Depois
export const SendRefreshToken = (res: Response, token: string): void => {
  res.cookie("jrt", token, { 
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Secure apenas em produção
    sameSite: process.env.NODE_ENV === "production" ? 'none' : 'lax', // Ajustado para funcionar com CORS
    path: '/',
    maxAge: 14 * 24 * 60 * 60 * 1000 // 14 dias em milissegundos
  });
  
  console.log("Cookie de refresh token definido com sucesso");
};
```

#### 5. Arquivo: `backend/src/app.ts`

**Problema**: Configuração CORS inadequada para suportar cookies e autenticação.

**Solução**: Aprimoramos a configuração CORS:

```typescript
// Antes
app.use(
  cors({
    credentials: true,
    origin: true, // Permite qualquer origem
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'Access-Control-Allow-Origin', 'Access-Control-Allow-Headers'],
    exposedHeaders: ['Access-Control-Allow-Origin', 'Access-Control-Allow-Credentials']
  })
);

// Depois
app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_URL || true, // Usa FRONTEND_URL ou permite qualquer origem
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'Access-Control-Allow-Origin', 'Access-Control-Allow-Headers', 'Access-Control-Allow-Credentials'],
    exposedHeaders: ['Access-Control-Allow-Origin', 'Access-Control-Allow-Credentials']
  })
);
```

## Impacto das Alterações

1. **Para usuários finais**:
   - Sessões ativas por períodos mais longos
   - Menos redirecionamentos para tela de login
   - Experiência de uso mais fluida, sem interrupções frequentes
   - Manutenção da sessão mesmo em caso de falhas temporárias de rede

2. **Para administradores do sistema**:
   - Logs mais detalhados facilitam o diagnóstico de problemas
   - Menor número de reclamações relacionadas a problemas de autenticação
   - Redução da carga nos servidores devido a menos requisições de login

3. **Para desenvolvedores**:
   - Código mais robusto e resiliente
   - Sistema de autenticação melhor documentado
   - Padrões de segurança modernos implementados

## Procedimento de Implantação

1. **Backup do sistema**:
   ```bash
   # Backup dos diretórios do frontend e backend
   cd /home/whaticket/whaticket10-main
   tar -czvf whaticket-backup-$(date +%Y%m%d).tar.gz frontend backend
   ```

2. **Aplicação das alterações**:
   - Modificar os arquivos conforme descrito na seção de Correções Implementadas
   - Verificar permissões e propriedade dos arquivos após as alterações

3. **Reinício dos serviços**:
   ```bash
   # Reiniciar todos os serviços
   pm2 restart all
   
   # Ou reiniciar individualmente
   pm2 restart backend
   pm2 restart frontend
   ```

4. **Verificação de logs**:
   ```bash
   # Monitorar logs em tempo real
   pm2 logs
   
   # Ou verificar logs específicos
   pm2 logs backend
   pm2 logs frontend
   ```

## Testes de Verificação

Após a implantação, é importante realizar os seguintes testes:

1. **Teste de login e persistência**:
   - Fazer login e verificar se a sessão permanece ativa por mais tempo
   - Navegar entre diferentes páginas da aplicação sem perder a sessão

2. **Teste de refresh automático**:
   - Deixar a sessão aberta por mais de 1 hora para verificar o refresh automático
   - Verificar nos logs do frontend se o refresh está ocorrendo sem redirecionamentos

3. **Teste de compatibilidade**:
   - Testar em diferentes navegadores (Chrome, Firefox, Safari, Edge)
   - Testar em dispositivos móveis e desktop

4. **Teste de falha de rede**:
   - Simular perda temporária de conexão para verificar a recuperação
   - Verificar se o sistema tenta reconectar automaticamente

## Recomendações Futuras

1. **Segurança adicional**:
   - Implementar sistema de rotação de tokens (um novo refresh token a cada uso)
   - Adicionar blacklist para tokens revogados em caso de logout explícito
   - Considerar implementação de autenticação em dois fatores (2FA)

2. **Monitoramento**:
   - Implementar sistema de alerta para falhas recorrentes de autenticação
   - Coletar métricas sobre ciclo de vida dos tokens e sessões

3. **Experiência do usuário**:
   - Adicionar feedback visual durante processos de refresh de token
   - Implementar opção "Mantenha-me conectado" para sessões mais longas

4. **Infraestrutura**:
   - Considerar a migração para um sistema de gerenciamento de sessão distribuído (Redis, por exemplo)
   - Implementar balanceamento de carga com persistência de sessão

## Glossário

- **JWT (JSON Web Token)**: Padrão para transmitir informações de autenticação de forma segura entre partes como um objeto JSON.
- **Access Token**: Token de curta duração usado para autorizar requisições à API.
- **Refresh Token**: Token de longa duração usado para obter novos access tokens sem necessidade de reautenticação.
- **CORS (Cross-Origin Resource Sharing)**: Mecanismo que permite que recursos restritos em uma página web sejam solicitados de outro domínio.
- **Cookies HttpOnly**: Cookies que não podem ser acessados via JavaScript, aumentando a segurança.
- **SameSite**: Atributo de cookie que controla quando os cookies são enviados em requisições cross-site.

---

**Documento preparado por:** Claude AI  
**Data:** 29/06/2023  
**Versão:** 1.0 