# Deploy Guide

## Configuração do GitHub Actions

Este projeto usa GitHub Actions para build e deploy automático. As principais melhorias implementadas:

### ✨ Mudanças Principais

1. **Docker Buildx**: Builds mais rápidos e eficientes
2. **Cache de Layers**: Redução significativa no tempo de build
3. **Deploy via Docker Compose**: Gerenciamento mais robusto dos containers
4. **Jobs Separados**: Build e Deploy em etapas independentes

### 🔧 Secrets Necessários

Configure os seguintes secrets no GitHub (Settings → Secrets and variables → Actions):

- `HOST`: IP ou hostname do servidor
- `USERNAME`: Usuário SSH do servidor
- `PORT`: Porta SSH (geralmente 22)
- `SSH_KEY`: Chave privada SSH (conteúdo completo)

### 📝 Setup no Servidor

1. **Instalar Docker e Docker Compose**:
```bash
# No servidor
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER
```

2. **Criar diretório do projeto**:
```bash
mkdir -p ~/mindera-games
```

3. **Configurar variável de ambiente** (opcional):
```bash
# No servidor, adicione ao ~/.bashrc ou ~/.profile
export GITHUB_REPOSITORY="seu-usuario/seu-repo"
```

### 🚀 Como Funciona

1. **Push para main**: Trigger automático
2. **Build Job**: 
   - Faz checkout do código
   - Configura Docker Buildx
   - Build das imagens backend e frontend com cache
   - Push para GitHub Container Registry
   
3. **Deploy Job**:
   - Copia `docker-compose.prod.yml` para o servidor
   - Faz login no GHCR
   - Pull das imagens mais recentes
   - Para containers antigos
   - Inicia novos containers
   - Limpa imagens não utilizadas

### 🔍 Debugging

Se o deploy falhar:

```bash
# No servidor, verifique os logs
cd ~/mindera-games
docker compose -f docker-compose.prod.yml logs

# Verifique containers rodando
docker compose -f docker-compose.prod.yml ps

# Restart manual se necessário
docker compose -f docker-compose.prod.yml restart
```

### 🎯 Deploy Manual

Caso precise fazer deploy manual:

```bash
cd ~/mindera-games
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

### ⚡ Vantagens da Nova Solução

- ✅ Sem timeout de SSH durante o build
- ✅ Builds mais rápidos com cache
- ✅ Melhor gerenciamento de containers com compose
- ✅ Deploy atômico (down → up)
- ✅ Limpeza automática de imagens antigas
- ✅ Jobs independentes (falha no deploy não afeta o build)

