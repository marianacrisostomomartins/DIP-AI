# Etapa 1: Build (Node.js)
FROM node:20 AS builder
WORKDIR /app
COPY . /app
RUN npm install
RUN npm run build

# Etapa 2: Produção (Nginx)
FROM nginx:stable-alpine
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
