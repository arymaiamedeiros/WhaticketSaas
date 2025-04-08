# Guia de Instalação - Whaticket SaaS

Este guia fornece instruções detalhadas para instalar o Whaticket SaaS em um sistema Ubuntu/Debian.

## Pré-requisitos

- Ubuntu 20.04 LTS ou superior / Debian 10 ou superior
- Mínimo de 4GB de RAM
- Mínimo de 20GB de espaço em disco
- Acesso root ou usuário com privilégios sudo
- Conexão com a internet

## 1. Atualização do Sistema

```bash
# Atualizar lista de pacotes
sudo apt update

# Atualizar sistema
sudo apt upgrade -y

# Instalar dependências básicas
sudo apt install -y curl wget git unzip
```

## 2. Instalação do Docker e Docker Compose

```bash
# Remover versões antigas (se existirem)
for pkg in docker.io docker-doc docker-compose podman-docker containerd runc; do sudo apt-get remove $pkg; done

# Instalar dependências
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg

# Adicionar repositório oficial do Docker
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Adicionar repositório do Docker para Debian
echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Atualizar lista de pacotes
sudo apt-get update

# Instalar Docker e ferramentas
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER

# Ativar serviço do Docker
sudo systemctl enable docker
sudo systemctl start docker

# Verificar instalação
docker --version
docker compose version
```

## 3. Instalação do Node.js e NPM

```bash
# Instalar Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalação
node --version
npm --version
```

## 4. Configuração do Projeto

```bash
# Clonar repositório
git clone https://github.com/seu-usuario/whaticket-saas.git
cd whaticket-saas

# Configurar variáveis de ambiente
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Editar arquivos .env conforme necessário
nano backend/.env
nano frontend/.env
```

## 5. Configuração do Banco de Dados e Backend

### 5.1 Instalação do PostgreSQL

```bash
# Instalar PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Iniciar serviço
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Criar usuário e banco de dados
sudo -u postgres psql -c "CREATE USER whaticket WITH PASSWORD 'sua_senha_segura';"
sudo -u postgres psql -c "CREATE DATABASE whaticket_db OWNER whaticket;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE whaticket_db TO whaticket;"
```

### 5.2 Configuração do Backend

```bash
# Entrar no diretório do backend
cd backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env

# Editar arquivo .env
nano .env
```

Exemplo de configuração do arquivo `.env`:

```env
NODE_ENV=production
BACKEND_URL=http://seu-dominio.com
FRONTEND_URL=http://seu-dominio.com:3000
PROXY_PORT=443
PORT=8080

DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USER=whaticket
DB_PASS=sua_senha_segura
DB_NAME=whaticket_db

JWT_SECRET=seu_jwt_secret
JWT_REFRESH_SECRET=seu_jwt_refresh_secret

REDIS_URI=redis://localhost:6379
REDIS_OPT_LIMITER_MAX=1
REDIS_OPT_LIMITER_DURATION=3000

USER_LIMIT=10000
CONNECTIONS_LIMIT=100000
CLOSED_SEND_BY_ME=true

GERENCIANET_SANDBOX=false
GERENCIANET_CLIENT_ID=seu_client_id
GERENCIANET_CLIENT_SECRET=seu_client_secret
GERENCIANET_PIX_CERT=seu_certificado
GERENCIANET_PIX_KEY=sua_chave_pix
```

### 5.3 Executando Migrações do Banco de Dados

```bash
# Instalar Sequelize CLI globalmente
npm install -g sequelize-cli

# Executar migrações
npx sequelize db:migrate

# Verificar status das migrações
npx sequelize db:migrate:status
```

### 5.4 Configurando o Redis

```bash
# Instalar Redis
sudo apt install -y redis-server

# Iniciar serviço
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Verificar status
sudo systemctl status redis-server
```

### 5.5 Iniciando o Backend

```bash
# Iniciar em modo desenvolvimento
npm run dev

# Ou iniciar em modo produção
npm run build
npm start
```

### 5.6 Verificando a Instalação

```bash
# Verificar status do PostgreSQL
sudo systemctl status postgresql

# Verificar status do Redis
sudo systemctl status redis-server

# Verificar logs do backend
tail -f logs/app.log

# Testar conexão com o banco
psql -U whaticket -d whaticket_db -h localhost
```

## 6. Instalação e Build do Frontend

```bash
# Instalar dependências
cd frontend
npm install

# Build do frontend
npm run build
cd ..
```

## 7. Inicialização dos Serviços

```bash
# Iniciar todos os serviços
docker-compose up -d

# Verificar status dos containers
docker-compose ps
```

## 8. Configuração do Nginx

```bash
# Instalar certificado SSL (opcional)
sudo apt install -y certbot python3-certbot-nginx

# Configurar certificado SSL
sudo certbot --nginx -d seu-dominio.com
```

## 9. Acesso aos Dashboards

- Frontend: http://seu-dominio.com
- Grafana: http://seu-dominio.com:3001
  - Usuário: admin
  - Senha: admin (altere no primeiro acesso)

## 10. Monitoramento

Os seguintes dashboards estarão disponíveis no Grafana:

1. System Metrics
   - Uso de CPU do sistema
   - Uso de memória do sistema

2. Node.js Metrics
   - Uso de CPU do processo Node.js
   - Uso de memória do processo Node.js

3. Container Metrics
   - Uso de CPU por container
   - Uso de memória por container

## 11. Manutenção

### Backup do Banco de Dados

```bash
# Criar backup
docker-compose exec db pg_dump -U user db_name > backup.sql

# Restaurar backup
cat backup.sql | docker-compose exec -T db psql -U user db_name
```

### Atualização do Sistema

```bash
# Parar serviços
docker-compose down

# Atualizar código
git pull

# Reconstruir imagens
docker-compose build

# Iniciar serviços
docker-compose up -d
```

## 12. Solução de Problemas

### Verificar Logs

```bash
# Logs do backend
docker-compose logs backend

# Logs do frontend
docker-compose logs frontend

# Logs do banco de dados
docker-compose logs db
```

### Reiniciar Serviços

```bash
# Reiniciar todos os serviços
docker-compose restart

# Reiniciar serviço específico
docker-compose restart backend
```

## 13. Segurança

1. Altere as senhas padrão:
   - Banco de dados
   - Grafana
   - Redis

2. Configure firewall:
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3001/tcp
sudo ufw enable
```

3. Mantenha o sistema atualizado:
```bash
sudo apt update && sudo apt upgrade -y
```

## Suporte

Para suporte adicional, consulte:
- [Documentação do Whaticket](https://github.com/canove/whaticket)
- [Issues do GitHub](https://github.com/seu-usuario/whaticket-saas/issues) 