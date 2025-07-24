# Etapa 1: Build (Node.js)
FROM node:20-alpine AS builder
WORKDIR /app

# Copia apenas package.json e package-lock.json primeiro (cache de dependências)
COPY package*.json ./
RUN npm ci --only=production --silent

# Copia o resto dos arquivos e faz o build
COPY . .
RUN npm run build

# Etapa 2: Produção (Nginx)
FROM nginx:stable-alpine

# Instala curl para health check
RUN apk add --no-cache curl

# Remove configuração padrão do nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia configuração customizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia arquivos buildados
COPY --from=builder /app/dist /usr/share/nginx/html

# Cria usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Define permissões corretas
RUN chown -R nextjs:nodejs /usr/share/nginx/html

# Para permitir que nginx rode sem root, vamos usar porta 8080
# e ajustar as permissões necessárias
RUN mkdir -p /var/cache/nginx/client_temp && \
    chown -R nextjs:nodejs /var/cache/nginx && \
    chown -R nextjs:nodejs /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown nextjs:nodejs /var/run/nginx.pid

USER nextjs

EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
