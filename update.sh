#!/bin/bash
# Script para atualizar o Halloween Bingo no servidor
# Execute: ./update.sh

echo "🎃 Atualizando Halloween Bingo..."

docker pull ghcr.io/domzinhuu/halloweengo/backend:latest
docker pull ghcr.io/domzinhuu/halloweengo/frontend:latest

docker stop halloweengo-backend halloweengo-frontend || true
docker rm halloweengo-backend halloweengo-frontend || true

docker run -d --name halloweengo-backend -p 5002:5002 --restart unless-stopped ghcr.io/domzinhuu/halloweengo/backend:latest
docker run -d --name halloweengo-frontend -p 3001:3001 --restart unless-stopped ghcr.io/domzinhuu/halloweengo/frontend:latest

echo "✅ Atualizado com sucesso!"
docker ps | grep halloweengo

