# ============================================
# Imagen base: Node.js 20.12.2 en Alpine Linux
# Alpine es una distribución ligera (~5MB)
# ============================================
FROM node:20.12.2-alpine

# Instalar wget para que funcione el healthcheck
# apk = gestor de paquetes de Alpine Linux
# --no-cache = no guarda cache, imagen más pequeña
RUN apk add --no-cache wget

# Establecer directorio de trabajo dentro del contenedor
# Todos los comandos siguientes se ejecutan aquí
WORKDIR /app

# Copiar solo archivos de dependencias primero
# Esto aprovecha el cache de Docker: si package.json no cambia,
# no reinstala las dependencias
COPY package*.json ./

# Instalar todas las dependencias (producción + desarrollo)
# Necesitamos devDependencies para compilar TypeScript
RUN npm install

# Copiar el resto del código fuente
# .dockerignore define qué NO copiar (node_modules, .git, etc)
COPY . .

# Compilar TypeScript a JavaScript
# Genera la carpeta dist/ con el código compilado
RUN npm run build

# Exponer el puerto 3000
# Esto es documentación, no abre el puerto (lo hace docker-compose)
EXPOSE 3000

# Comando por defecto al iniciar el contenedor
# Ejecuta: node dist/server.js
CMD ["npm", "start"]

