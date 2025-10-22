# Dockerfile para Fly.io

FROM node:20-alpine

# Instalar dependencias del sistema
RUN apk add --no-cache bash curl

# Crear directorio de trabajo
WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias (incluyendo devDependencies para ts-node)
RUN npm ci

# Copiar código fuente
COPY . .

# Crear directorio para uploads
RUN mkdir -p uploads

# Exponer puerto
EXPOSE 8080

# Comando de inicio usando ts-node
CMD ["npx", "ts-node", "--transpile-only", "src/index.ts"]

