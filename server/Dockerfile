# Dockerfile para Fly.io

FROM node:20-alpine

# Instalar dependencias del sistema
RUN apk add --no-cache bash curl

# Crear directorio de trabajo
WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Exponer puerto
EXPOSE 8080

# Comando de inicio usando ts-node (igual que Render)
CMD ["npx", "ts-node", "--transpile-only", "src/index.ts"]

