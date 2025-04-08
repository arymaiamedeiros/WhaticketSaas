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

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/whaticket-saas.git
cd whaticket-saas
```

2. Configure as variáveis de ambiente:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

3. Edite os arquivos .env com suas configurações

4. Inicie os containers:
```bash
docker-compose up -d
```

5. Acesse a aplicação:
- Frontend: http://localhost:3000
- Backend: http://localhost:8080
- API Docs: http://localhost:8080/api-docs

## 🧪 Testes

```bash
# Testes do frontend
cd frontend
npm test

# Testes do backend
cd backend
npm test
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

## 📞 Suporte

Para suporte, envie um email para suporte@whaticket.com ou abra uma issue no GitHub.

## 🙏 Agradecimentos

- Equipe de desenvolvimento
- Comunidade open source
- Contribuidores 