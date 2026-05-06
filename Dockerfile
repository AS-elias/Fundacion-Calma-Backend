# 1. Usar imagen oficial de Node v20
FROM node:20-alpine

# 2. Crear directorio de trabajo
WORKDIR /usr/src/app

# 3. Copiar archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# 4. Instalar dependencias
RUN npm install

# 5. Copiar el resto del código
COPY . .

# 6. Generar el cliente de Prisma
RUN npx prisma generate

# 7. Exponer puerto de la app
EXPOSE 3005

# 8. Comando para desarrollo
CMD ["npm", "run", "start:dev"]
