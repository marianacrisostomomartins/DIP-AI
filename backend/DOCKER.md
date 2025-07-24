# Docker Setup para o Backend DIP-AI

## Deploy em Produção (HTTPS)

### Configuração Rápida

```bash
# 1. Subir o ambiente de produção
docker compose -f docker-compose.yml up -d

# 2. Verificar se os containers estão rodando
docker compose -f docker-compose.yml ps
```

### Portas no Roteador/Firewall

Libere as seguintes portas:
- **Porta 80**: HTTP (redirect para HTTPS)
- **Porta 443**: HTTPS (acesso principal)

### Arquitetura de Produção

```
Internet → Nginx (443/HTTPS) → Backend FastAPI (8000/HTTP interno)
          ↓
      Redirect 80→443
```

## 📝 Variáveis de Ambiente

### Produção (.env.production)
```env
DATABASE_URL=postgresql://dipuser:dippassword@localhost:5432/dipdb
ENVIRONMENT=production
CORS_ORIGINS=https://dip-ai.vercel.app,https://*.vercel.app
API_BASE_URL=https://186.213.212.140
SSL_ENABLED=true
SECRET_KEY=jdU/WTowsl2EuwKFtBZptPIeeynXKBylr3wFCW4BnPE=
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

## Acessos

### Produção (HTTPS)
- **API Backend**: https://186.213.212.140
- **Documentação da API**: https://186.213.212.140/docs
- **Health Check**: https://186.213.212.140/health

### Desenvolvimento
- **API Backend**: http://localhost:8000
- **Documentação da API**: http://localhost:8000/docs

## Monitoramento

```bash
# Ver logs do nginx e backend
docker-compose -f docker-compose-ssl.yml logs -f

# Ver logs apenas do backend
docker-compose -f docker-compose-ssl.yml logs -f backend

# Ver logs apenas do nginx
docker-compose -f docker-compose-ssl.yml logs -f nginx

# Status dos containers
docker-compose -f docker-compose-ssl.yml ps

# Reiniciar serviços
docker-compose -f docker-compose-ssl.yml restart
```

## Manutenção

```bash
# Parar os serviços
docker-compose -f docker-compose-ssl.yml down

# Rebuild e restart
docker-compose -f docker-compose-ssl.yml up -d --build

# Limpar containers antigos
docker system prune -f
```

## 🔒 Segurança

⚠️ **Certificados SSL**: Os certificados gerados são auto-assinados para desenvolvimento. Para produção, use:
- **Let's Encrypt** (gratuito)
- **CloudFlare** (gratuito)
- **Certificados comerciais**

```bash
# Para usar Let's Encrypt (exemplo):
# certbot certonly --standalone -d 186.213.212.140
# Depois copie os certificados para ./ssl/
```