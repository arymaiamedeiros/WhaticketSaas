#!/bin/bash

# Script para aplicar correções no sistema Whaticket
# Este script aplica as correções de logs excessivos e reconstrói o frontend

echo "==========================================="
echo "  Aplicando correções no sistema Whaticket"
echo "==========================================="

# Cores para formatação
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Diretório base do projeto
BASE_DIR=$(pwd)

echo -e "${YELLOW}Verificando estrutura do projeto...${NC}"

# Verifica se estamos no diretório correto
if [ ! -d "$BASE_DIR/frontend" ] || [ ! -d "$BASE_DIR/backend" ]; then
    echo -e "${RED}Erro: Este script deve ser executado na pasta raiz do projeto Whaticket${NC}"
    exit 1
fi

echo -e "${GREEN}Estrutura do projeto verificada com sucesso!${NC}"

# Aplica as correções no frontend
echo -e "\n${YELLOW}Aplicando correções no frontend...${NC}"

cd "$BASE_DIR/frontend"

# Verifica se o arquivo console-filter.js existe
if [ ! -f "$BASE_DIR/frontend/public/console-filter.js" ]; then
    echo -e "${RED}Arquivo console-filter.js não encontrado.${NC}"
    echo -e "${RED}As correções devem ser aplicadas manualmente.${NC}"
    exit 1
fi

echo -e "${GREEN}Arquivo console-filter.js encontrado!${NC}"

# Reconstruir o frontend
echo -e "\n${YELLOW}Reconstruindo o frontend...${NC}"
echo -e "${YELLOW}Isso pode levar alguns minutos, por favor aguarde...${NC}"

# Limpa a pasta de build
if [ -d "$BASE_DIR/frontend/build" ]; then
    echo "Limpando diretório de build anterior..."
    rm -rf "$BASE_DIR/frontend/build"
fi

# Instala dependências se necessário
if [ ! -d "$BASE_DIR/frontend/node_modules" ]; then
    echo "Instalando dependências do frontend..."
    npm install
fi

# Constrói o frontend
echo "Executando build do frontend..."
npm run build

# Verifica se o build foi bem-sucedido
if [ $? -ne 0 ]; then
    echo -e "${RED}Erro durante a construção do frontend.${NC}"
    echo -e "${RED}Por favor, verifique os logs acima para mais detalhes.${NC}"
    exit 1
fi

echo -e "${GREEN}Frontend reconstruído com sucesso!${NC}"

# Voltar para o diretório base
cd "$BASE_DIR"

echo -e "\n${GREEN}Todas as correções foram aplicadas com sucesso!${NC}"
echo -e "\n${YELLOW}Próximos passos:${NC}"
echo "1. Reinicie o servidor frontend"
echo "2. Limpe o cache do navegador (Ctrl+F5 ou Cmd+Shift+R)"
echo "3. Verifique se os logs excessivos não aparecem mais no console"

echo -e "\n${GREEN}Documentação completa das correções está disponível nos arquivos:${NC}"
echo "- correcao_logs_socket_e_otimizacao.md"
echo "- correcao_logs_socket_solucao_imediata.md"

echo -e "\n${YELLOW}Para reiniciar o frontend:${NC}"
echo "cd frontend && npm start"

echo -e "\n${GREEN}Processo de correção concluído!${NC}" 