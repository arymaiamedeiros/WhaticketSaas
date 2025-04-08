# Documentação Técnica - Whaticket SaaS

## Índice

1. [Arquitetura](#arquitetura)
2. [Tecnologias](#tecnologias)
3. [Segurança](#segurança)
4. [APIs](#apis)
5. [Banco de Dados](#banco-de-dados)
6. [Monitoramento](#monitoramento)
7. [Deploy](#deploy)
8. [Testes](#testes)

## Arquitetura

### Visão Geral
O Whaticket SaaS é uma aplicação distribuída que segue uma arquitetura de microsserviços. Os principais componentes são:

- Frontend (React)
- Backend API (Node.js)
- Serviço de Filas (Redis)
- Banco de Dados (PostgreSQL)
- Cache (Redis)
- Proxy Reverso (Nginx)
- Monitoramento (Prometheus/Grafana)

### Diagrama de Arquitetura
```
[Cliente] → [CloudFlare] → [Load Balancer]
                              ↓
[Nginx] → [Frontend (React)] → [Backend API] → [PostgreSQL]
                                    ↓
                              [Redis (Cache/Queue)]
                                    ↓
                            [WhatsApp API Client]
```

## Tecnologias

### Frontend
- React 18
- TypeScript
- Material-UI 5
- Redux Toolkit
- React Query
- Socket.io Client
- Axios
- Jest/Testing Library

### Backend
- Node.js
- Express
- TypeScript
- PostgreSQL
- Redis
- Socket.io
- JWT
- Sequelize
- Jest

### DevOps
- Docker
- Docker Compose
- GitHub Actions
- AWS (ECS, RDS, ElastiCache)
- Prometheus/Grafana
- ELK Stack

## Segurança

### Autenticação
- JWT com refresh tokens
- Autenticação em duas etapas (2FA)
- Códigos de backup
- Rate limiting
- Bloqueio de conta após tentativas falhas

### Proteção de Dados
- Criptografia em repouso
- SSL/TLS
- Headers de segurança
- Sanitização de entrada
- Validação de arquivos
- CSP (Content Security Policy)

### Conformidade
- LGPD
- Logs de auditoria
- Backup automático
- Política de retenção de dados

## APIs

### Endpoints Principais

#### Autenticação
```
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/2fa/enable
POST /api/auth/2fa/verify
```

#### Usuários
```
GET /api/users
POST /api/users
PUT /api/users/:id
DELETE /api/users/:id
```

#### Tickets
```
GET /api/tickets
POST /api/tickets
PUT /api/tickets/:id
DELETE /api/tickets/:id
```

#### WhatsApp
```
POST /api/whatsapp/send
POST /api/whatsapp/status
GET /api/whatsapp/qr
```

### Websockets
- Conexão: `ws://api.whaticket.com/socket.io`
- Eventos:
  - `message`
  - `status`
  - `qr`
  - `connection`

## Banco de Dados

### Modelo de Dados
```sql
-- Usuários
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  two_factor_secret VARCHAR(255),
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  backup_codes TEXT[]
);

-- Tickets
CREATE TABLE tickets (
  id SERIAL PRIMARY KEY,
  status VARCHAR(50),
  priority VARCHAR(50),
  user_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Mensagens
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER REFERENCES tickets(id),
  body TEXT,
  direction VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Índices
```sql
CREATE INDEX idx_tickets_user_id ON tickets(user_id);
CREATE INDEX idx_messages_ticket_id ON messages(ticket_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_created_at ON tickets(created_at);
```

## Monitoramento

### Métricas Coletadas
- Latência de requisições
- Taxa de erros
- Uso de CPU/memória
- Conexões de banco de dados
- Fila de mensagens
- Sessões ativas
- Taxa de sucesso de envio

### Alertas
- Alto uso de CPU/memória
- Erro de conexão com WhatsApp
- Taxa de erro > 1%
- Latência alta
- Fila crescente
- Disco cheio

### Dashboards
- Performance geral
- Métricas de negócio
- Uso de recursos
- Logs de erro
- Auditoria

## Deploy

### Ambientes
- Desenvolvimento
- Staging
- Produção

### Pipeline de CI/CD
1. Testes
2. Build
3. Análise de código
4. Deploy em staging
5. Testes de integração
6. Deploy em produção
7. Monitoramento pós-deploy

### Rollback
- Versionamento de banco
- Imagens Docker taggeadas
- Procedimento documentado

## Testes

### Unitários
- Controllers
- Services
- Models
- Utils

### Integração
- API endpoints
- WebSocket
- Banco de dados
- Cache

### E2E
- Fluxos críticos
- Interface do usuário
- Performance

### Cobertura
- Mínimo: 80%
- Branches
- Funções
- Linhas 