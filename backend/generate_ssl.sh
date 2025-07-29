#!/bin/bash

# Script para gerar certificados SSL auto-assinados para desenvolvimento
# IMPORTANTE: Para produção, use certificados válidos (Let's Encrypt, etc.)

mkdir -p /app/ssl

# Gerar chave privada
openssl genrsa -out /app/ssl/private.key 2048

# Gerar certificado auto-assinado válido por 365 dias
openssl req -new -x509 -key /app/ssl/private.key -out /app/ssl/certificate.crt -days 365 \
    -subj "/C=BR/ST=State/L=City/O=Organization/CN=191.25.235.57"

echo "Certificados SSL gerados em /app/ssl/"
