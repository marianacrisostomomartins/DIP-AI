#!/bin/bash

# Script para gerar certificados SSL auto-assinados para desenvolvimento
# IMPORTANTE: Para produção, use certificados válidos (Let's Encrypt, etc.)

set -e

# Diretório para os certificados SSL (relativo ao script)
SSL_DIR="./ssl"

echo "🔐 Gerando certificados SSL para desenvolvimento..."

# Criar diretório SSL se não existir
mkdir -p "$SSL_DIR"

# Verificar se OpenSSL está instalado
if ! command -v openssl &> /dev/null; then
    echo "❌ OpenSSL não está instalado. Instalando..."
    apt-get update && apt-get install -y openssl
fi

# Gerar chave privada
echo "🔑 Gerando chave privada..."
openssl genrsa -out "$SSL_DIR/private.key" 2048

# Gerar certificado auto-assinado válido por 365 dias
echo "📜 Gerando certificado auto-assinado..."
openssl req -new -x509 -key "$SSL_DIR/private.key" -out "$SSL_DIR/certificate.crt" -days 365 \
    -subj "/C=BR/ST=SP/L=SaoPaulo/O=DIP-AI Development/CN=localhost"

# Definir permissões apropriadas
chmod 600 "$SSL_DIR/private.key"
chmod 644 "$SSL_DIR/certificate.crt"

echo "✅ Certificados SSL gerados com sucesso em $SSL_DIR/"
echo ""
echo "📋 Arquivos criados:"
ls -la "$SSL_DIR/"
echo ""
echo "📋 Informações do certificado:"
openssl x509 -in "$SSL_DIR/certificate.crt" -text -noout | grep -E "Subject:|Not Before:|Not After:|DNS:|IP Address:" || true
echo ""
echo "⚠️  ATENÇÃO: Este é um certificado auto-assinado para desenvolvimento."
echo "   Para produção, use certificados válidos (Let's Encrypt, etc.)"
