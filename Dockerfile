# ==============================
# STAGE 1: Dependencias y build
# ==============================
FROM node:20.12.2-alpine AS builder

WORKDIR /app

RUN apk add --no-cache wget

# Copiar dependencias
COPY package*.json ./
RUN npm install

# Copiar el resto del código
COPY . .

# Ejecutar pruebas antes de la compilación
# (si las pruebas fallan, el build falla y Jenkins lo detecta)
RUN npm test

# Compilar TypeScript
RUN npm run build

# =============================
# STAGE 2: Imagen final ligera
# =============================
FROM node:20.12.2-alpine AS production

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["npm", "start"]
