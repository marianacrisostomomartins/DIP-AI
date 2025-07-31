#!/bin/bash

# Script para gerar certificados SSL auto-assinados para desenvolvimento
# IMPORTANTE: Para produção, use certificados válidos (Let's Encrypt, etc.)

# Diretório para os certificados SSL (relativo ao script)
SSL_DIR="./ssl"

# Criar diretório SSL se não existir
mkdir -p "$SSL_DIR"

# Gerar chave privada
openssl genrsa -out "$SSL_DIR/private.key" 2048

# Gerar certificado auto-assinado válido por 365 dias
openssl req -new -x509 -key "$SSL_DIR/private.key" -out "$SSL_DIR/certificate.crt" -days 365 \
    -subj "/C=BR/ST=State/L=City/O=Organization/CN=191.25.235.57"

echo "Certificados SSL gerados em $SSL_DIR/"
echo "Arquivos criados:"
ls -la "$SSL_DIR/"
