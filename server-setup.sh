#!/bin/bash

# Script para configuração inicial do servidor
# Execute este script no servidor antes do primeiro deploy

set -e

echo "🚀 Configurando servidor para deploy..."

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}Docker não encontrado. Instalando...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    echo -e "${GREEN}✓ Docker instalado${NC}"
else
    echo -e "${GREEN}✓ Docker já instalado${NC}"
fi

# Adicionar usuário ao grupo docker
if ! groups $USER | grep -q docker; then
    echo -e "${YELLOW}Adicionando usuário ao grupo docker...${NC}"
    sudo usermod -aG docker $USER
    echo -e "${GREEN}✓ Usuário adicionado ao grupo docker${NC}"
    echo -e "${YELLOW}⚠️  Faça logout e login novamente para aplicar as mudanças${NC}"
else
    echo -e "${GREEN}✓ Usuário já está no grupo docker${NC}"
fi

# Criar diretório do projeto
PROJECT_DIR="$HOME/mindera-games"
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${YELLOW}Criando diretório do projeto...${NC}"
    mkdir -p "$PROJECT_DIR"
    echo -e "${GREEN}✓ Diretório criado: $PROJECT_DIR${NC}"
else
    echo -e "${GREEN}✓ Diretório já existe: $PROJECT_DIR${NC}"
fi

# Verificar versão do Docker
DOCKER_VERSION=$(docker --version)
echo -e "${GREEN}✓ $DOCKER_VERSION${NC}"

# Verificar Docker Compose
if docker compose version &> /dev/null; then
    COMPOSE_VERSION=$(docker compose version)
    echo -e "${GREEN}✓ $COMPOSE_VERSION${NC}"
else
    echo -e "${YELLOW}⚠️  Docker Compose não encontrado${NC}"
fi

echo ""
echo -e "${GREEN}✅ Configuração concluída!${NC}"
echo ""
echo "Próximos passos:"
echo "1. Configure os secrets no GitHub Actions"
echo "2. Faça push para a branch main"
echo "3. O deploy será automático"
echo ""
echo "Para deploy manual:"
echo "  cd $PROJECT_DIR"
echo "  docker compose -f docker-compose.prod.yml up -d"

