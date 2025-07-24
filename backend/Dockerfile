# Use uma imagem oficial do Python como base
FROM python:3.12-slim

# Instalar OpenSSL para gerar certificados
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Definir o diretório de trabalho no container
WORKDIR /app

# Copiar os arquivos de dependências primeiro (para aproveitar o cache do Docker)
COPY requirements.txt .

# Instalar as dependências do Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiar o código da aplicação
COPY . .

# Copiar e tornar executável o script de geração SSL
COPY generate_ssl.sh .
RUN chmod +x generate_ssl.sh

# Expor a porta 8000 (HTTPS com SSL)
EXPOSE 8000

# Comando para executar a aplicação
CMD ["sh", "-c", "./generate_ssl.sh && uvicorn app.main:app --host 0.0.0.0 --port 8000 --ssl-keyfile /app/ssl/private.key --ssl-certfile /app/ssl/certificate.crt"]
