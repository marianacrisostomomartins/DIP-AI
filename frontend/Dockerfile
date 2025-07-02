# Use a imagem oficial do Node.js 20
FROM node:20


# Defina o diretório de trabalho
WORKDIR /app

# Copie apenas o conteúdo do frontend para dentro do container
COPY . /app


# Instale dependências do sistema necessárias para evitar erro xdg-open
RUN apt-get update && apt-get install -y xdg-utils && rm -rf /var/lib/apt/lists/*

# Instale as dependências do projeto
RUN npm install

# Exponha a porta padrão do Vite
EXPOSE 5173

# Comando para rodar o servidor de desenvolvimento
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
