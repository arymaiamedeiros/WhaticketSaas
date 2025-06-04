# Whaticket SaaS

Sistema de atendimento ao cliente via WhatsApp integrado com múltiplos canais de comunicação.

## 🚀 Funcionalidades

- Integração com WhatsApp Business API
- Chat em tempo real
- Gerenciamento de tickets
- Dashboard analítico
- Integração com Gerencianet para pagamentos
- Suporte a múltiplos usuários
- Sistema de filas
- Relatórios detalhados
- API RESTful
- Interface responsiva

## 🛠️ Tecnologias

### Frontend
- React 18
- TypeScript
- Material-UI 5
- Redux Toolkit
- React Query
- Socket.io Client
- Axios
- Formik
- Yup

### Backend
- Node.js
- Express
- TypeScript
- PostgreSQL
- Redis
- Socket.io
- JWT
- Sequelize

### Infraestrutura
- Docker
- Docker Compose
- Nginx
- PostgreSQL
- Redis

## 📋 Pré-requisitos

- Node.js 18+
- Docker
- Docker Compose
- Git

# Whaticket - Instalação com Docker

Este projeto é uma aplicação de atendimento ao cliente via WhatsApp, construída com Node.js, React e PostgreSQL.

## Requisitos

- Docker
- Docker Compose

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/arymaiamedeiros/WhaticketSaas.git
cd whaticket
```

2. Configure as variáveis de ambiente:
   - O arquivo `docker-compose.yml` já contém as configurações básicas
   - Você pode modificar as variáveis de ambiente conforme necessário

3. Inicie os containers:
```bash
docker-compose up -d
```

4. Aguarde alguns minutos para que todos os serviços sejam iniciados

5. Acesse a aplicação:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8080

## Serviços

O projeto consiste em 4 serviços principais:

1. **PostgreSQL** (porta 5432)
   - Banco de dados principal
   - Dados persistentes armazenados em volume Docker

2. **Redis** (porta 6379)
   - Cache e gerenciamento de sessões
   - Armazenamento temporário de dados

3. **Backend** (porta 8080)
   - API REST
   - Integração com WhatsApp
   - Processamento de mensagens

4. **Frontend** (porta 3000)
   - Interface do usuário
   - Dashboard de atendimento
   - Gerenciamento de tickets

## Configuração

### Variáveis de Ambiente

#### Backend
- `NODE_ENV`: ambiente de execução
- `DB_DIALECT`: tipo de banco de dados
- `DB_HOST`: host do banco de dados
- `DB_USER`: usuário do banco de dados
- `DB_PASS`: senha do banco de dados
- `DB_NAME`: nome do banco de dados
- `REDIS_URI`: URI de conexão com Redis
- `FRONTEND_URL`: URL do frontend
- `BACKEND_URL`: URL do backend

#### Frontend
- `REACT_APP_BACKEND_URL`: URL do backend

## Volumes

- `postgres_data`: Armazena os dados do PostgreSQL
- `./backend:/usr/src/app`: Código fonte do backend
- `./frontend:/usr/src/app`: Código fonte do frontend

## Redes

- `whaticket-network`: Rede interna para comunicação entre os containers

## Comandos Úteis

- Iniciar todos os serviços:
```bash
docker-compose up -d
```

- Parar todos os serviços:
```bash
docker-compose down
```

- Ver logs:
```bash
docker-compose logs -f
```

- Reconstruir containers:
```bash
docker-compose up -d --build
```

## 📦 Deploy

1. Configure as variáveis de ambiente de produção
2. Construa as imagens Docker:
```bash
docker-compose -f docker-compose.prod.yml build
```

3. Inicie os serviços:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 📚 Documentação

- [Documentação da API](docs/api.md)
- [Guia de Contribuição](docs/CONTRIBUTING.md)
- [Changelog](docs/CHANGELOG.md)

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🙏 Agradecimentos

- Equipe de desenvolvimento
- Comunidade open source
- Contribuidores 