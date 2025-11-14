# 🧪 [B1] Test de Endpoint GET /api/movies - Guía de Ejecución

## 👤 Responsable
**Integrante:** Wilmere León (@wilmereleon)  
**Tarjeta:** [B1] Test de Endpoint GET /api/movies (Backend)  
**Issue:** #11  
**Rama:** `feature/integrante3-test-b1`

---

## 🎯 Objetivo del Test

Probar el endpoint `GET /api/movies` del backend para verificar:

1. ✅ Respuesta con status 200 OK
2. ✅ Retorna exactamente 10 películas
3. ✅ Estructura correcta de respuesta (`success`, `data`, `count`)
4. ✅ Cada película tiene todos los campos obligatorios
5. ✅ `imdbId` con formato válido (ttXXXXXXX)
6. ✅ `likes` es un número >= 0
7. ✅ `imdbRating` tiene formato válido
8. ✅ Tiempo de respuesta < 5 segundos
9. ✅ Incluye películas populares conocidas
10. ✅ `poster` es una URL válida

---

## 🛠️ Herramientas Utilizadas

### Backend Testing
- **Jest** - Framework de testing para Node.js/TypeScript
- **Supertest** - Testing de endpoints HTTP
- **jest-junit** - Generación de reportes JUnit XML
- **ESLint** - Linter para TypeScript

### Pipeline (Jenkinsfile)
- **NodeJS 20** (configurado en Jenkins)
- **Docker** (para build de imagen)
- **Git** (control de versiones)

---

## 📁 Estructura de Archivos

\`\`\`
movie-bff/
├── Jenkinsfile                          ⬅️ Pipeline CI/CD
├── src/
│   ├── __tests__/
│   │   └── movies.test.ts              ⬅️ Tests de [B1]
│   ├── controllers/
│   │   └── movieController.ts          ⬅️ Controlador a testear
│   └── ...
├── jest.config.js                       ⬅️ Configuración de Jest
├── package.json                         ⬅️ Scripts de test
└── documentacion/entrega1/
    └── ISSUE_1_TEST_B1.md              ⬅️ Este archivo
\`\`\`

---

## 🚀 Configuración del Jenkinsfile

### Stages del Pipeline

#### 1️⃣ **Checkout** (~3s)
\`\`\`groovy
stage('Checkout') {
    echo '📦 Clonando repositorio...'
    checkout scm
    sh 'git log -1 --pretty=format:"%h - %an: %s"'
}
\`\`\`
- Clona el repositorio desde GitHub
- Muestra último commit

#### 2️⃣ **Install Dependencies** (~30s)
\`\`\`groovy
stage('Install Dependencies') {
    echo '📚 Instalando dependencias de Node.js...'
    sh 'node --version'
    sh 'npm --version'
    sh 'npm ci'  // Instalación limpia y reproducible
}
\`\`\`
- Verifica versiones de Node.js y npm
- Instala dependencias con `npm ci` (más rápido y determinístico que `npm install`)

#### 3️⃣ **Lint** (~5s)
\`\`\`groovy
stage('Lint') {
    echo '🔍 Ejecutando ESLint...'
    sh 'npm run lint'
}
\`\`\`
- Ejecuta ESLint para verificar código TypeScript
- Script en `package.json`: `"lint": "eslint . --ext .ts"`
- Falla el pipeline si hay errores de linting

#### 4️⃣ **Build** (~10s)
\`\`\`groovy
stage('Build') {
    echo '🏗️ Compilando TypeScript...'
    sh 'npm run build'
    sh 'ls -la dist/'
}
\`\`\`
- Compila TypeScript a JavaScript
- Genera carpeta `dist/` con código compilado
- Verifica que los archivos se generaron correctamente

#### 5️⃣ **Test** (~12s) ⬅️ **TU STAGE PRINCIPAL [B1]**
\`\`\`groovy
stage('Test') {
    echo '🧪 Ejecutando tests con Jest...'
    sh 'npm test'
    
    post {
        always {
            // Publicar resultados de tests
            junit allowEmptyResults: true, testResults: 'junit.xml'
            
            // Publicar reporte de coverage
            publishHTML([
                allowMissing: true,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'coverage/lcov-report',
                reportFiles: 'index.html',
                reportName: 'Coverage Report'
            ])
        }
    }
}
\`\`\`
- Ejecuta todos los tests con Jest
- Genera `junit.xml` para Jenkins
- Genera reporte HTML de coverage
- Publica ambos reportes en Jenkins UI

#### 6️⃣ **Docker Build** (~80s)
\`\`\`groovy
stage('Docker Build') {
    when {
        anyOf {
            branch 'main'
            branch 'develop'
        }
    }
    echo '🐳 Construyendo imagen Docker...'
    script {
        def imageTag = "${env.BRANCH_NAME}-${env.BUILD_NUMBER}"
        sh "docker build -t movie-bff:${imageTag} ."
        sh "docker tag movie-bff:${imageTag} movie-bff:latest"
    }
}
\`\`\`
- Solo se ejecuta en ramas `main` y `develop`
- Construye imagen Docker del backend
- Taguea con `branch-buildNumber` y `latest`

#### 7️⃣ **Docker Push** (Condicional)
\`\`\`groovy
stage('Docker Push') {
    when {
        branch 'main'
    }
    echo '📤 Subiendo imagen a Docker Registry...'
    // Requiere credenciales 'docker-hub-credentials' en Jenkins
}
\`\`\`
- Solo se ejecuta en rama `main`
- Sube imagen a Docker Hub
- Requiere credenciales configuradas previamente

#### 8️⃣ **Deploy** (Condicional)
\`\`\`groovy
stage('Deploy') {
    when {
        branch 'main'
    }
    echo '🚀 Desplegando a producción...'
    // Comandos de despliegue según ambiente
}
\`\`\`
- Solo se ejecuta en rama `main`
- Despliega a producción (a configurar)

---

## 🧪 Ejecución Local de Tests

### Prerequisitos
\`\`\`bash
# Verificar Node.js y npm
node --version  # v20.x.x
npm --version   # v10.x.x
\`\`\`

### Pasos

#### 1. Instalar dependencias
\`\`\`bash
npm ci
\`\`\`

#### 2. Ejecutar Lint
\`\`\`bash
npm run lint
\`\`\`

#### 3. Compilar TypeScript
\`\`\`bash
npm run build
\`\`\`

#### 4. Ejecutar Tests
\`\`\`bash
npm test
\`\`\`

#### 5. Ejecutar Tests con Coverage
\`\`\`bash
npm test -- --coverage
\`\`\`

#### 6. Ver Coverage Report
\`\`\`bash
# Windows
Invoke-Item coverage/lcov-report/index.html

# Linux/Mac
open coverage/lcov-report/index.html
\`\`\`

---

## 📊 Reportes Generados

### 1. **junit.xml**
- Formato: JUnit XML
- Ubicación: `./junit.xml`
- Contenido: Resultados de tests (passed, failed, skipped)
- Consumido por: Jenkins (Test Results)

### 2. **Coverage Report (HTML)**
- Formato: HTML interactivo
- Ubicación: `./coverage/lcov-report/index.html`
- Contenido: 
  - Overall coverage: ~40.46%
  - Breakdown por archivo (controllers, models, routes, middlewares)
  - Código coloreado (verde=cubierto, rojo=sin cobertura)
- Consumido por: Jenkins (HTML Publisher)

### 3. **lcov.info**
- Formato: LCOV
- Ubicación: `./coverage/lcov.info`
- Contenido: Coverage en formato texto para herramientas externas

---

## ✅ Criterios de Validación

### Tests que deben pasar (10 total):

1. ✅ **Debe responder con status 200 OK**
   - Verifica que el endpoint responde correctamente

2. ✅ **Debe retornar exactamente 10 películas**
   - Valida el array `data` tiene longitud 10

3. ✅ **Debe tener la estructura correcta de respuesta**
   - Valida propiedades: `success`, `data`, `count`

4. ✅ **Cada película debe tener todos los campos obligatorios**
   - Campos: `imdbId`, `title`, `year`, `genre`, `director`, `actors`, `plot`, `poster`, `imdbRating`, `imdbVotes`, `runtime`, `likes`

5. ✅ **Cada película debe tener imdbId con formato válido (ttXXXXXXX)**
   - Regex: `/^tt\d{7,8}$/`

6. ✅ **El campo likes debe ser un número mayor o igual a 0**
   - Tipo: number
   - Rango: >= 0

7. ✅ **El campo imdbRating debe ser un string con formato válido**
   - Ejemplos: "8.5", "9.0", "7.8"

8. ✅ **El endpoint debe responder en menos de 5 segundos**
   - Performance test

9. ✅ **Debe incluir al menos algunas películas populares conocidas**
   - Verifica presencia de: "The Shawshank Redemption", "The Godfather", "The Dark Knight"

10. ✅ **El campo poster debe ser una URL válida**
    - Regex: `/^https?:\/\/.+/`

---

## 🔄 Flujo de Trabajo Git

### 1. Crear rama de trabajo
\`\`\`bash
git checkout -b feature/integrante3-test-b1
\`\`\`

### 2. Hacer cambios y commit
\`\`\`bash
git add .
git commit -m "test: Agregar test suite [B1] para GET /api/movies"
\`\`\`

### 3. Push a GitHub
\`\`\`bash
git push origin feature/integrante3-test-b1
\`\`\`

### 4. Webhook dispara Jenkins
- GitHub webhook detecta push
- Jenkins ejecuta pipeline automáticamente
- Build aparece en Jenkins UI

### 5. Ver resultados en Jenkins
- Ir a Jenkins → `movie-bff-pipeline`
- Clic en último build
- Ver Console Output + Test Results + Coverage Report

### 6. Crear Pull Request
- GitHub → Pull Requests → New Pull Request
- Base: `main` ← Compare: `feature/integrante3-test-b1`
- Descripción: Incluir resultados de tests y coverage
- Solicitar review

---

## ⚠️ Troubleshooting

### Problema: `npm test` falla con "Error: no test specified"
**Solución:** Configurar script de test en `package.json`:
\`\`\`json
{
  "scripts": {
    "test": "jest --coverage --reporters=default --reporters=jest-junit"
  }
}
\`\`\`

### Problema: ESLint falla con errores de sintaxis
**Solución:** Ejecutar auto-fix:
\`\`\`bash
npm run lint:fix
\`\`\`

### Problema: TypeScript compilation errors
**Solución:** Verificar `tsconfig.json` y corregir errores de tipos

### Problema: Tests fallan por conexión a PostgreSQL
**Solución:** Verificar que `.env` tenga configuración correcta:
\`\`\`env
DB_HOST=localhost
DB_PORT=5433
DB_NAME=movie_bff_db
DB_USER=movie_user
DB_PASSWORD=movie_password
\`\`\`

### Problema: Docker build falla con "daemon not found"
**Solución:** Verificar que Docker Desktop esté corriendo y accesible desde Jenkins

### Problema: Jenkins no detecta push
**Solución:** 
1. Verificar webhook en GitHub Settings → Webhooks
2. URL debe ser pública y accesible: `http://<JENKINS_IP>:8080/github-webhook/`
3. Verificar que "GitHub hook trigger for GITScm polling" esté activado en Jenkins job

---

## 📝 Notas Adicionales

### Diferencias con Frontend (Vitest)
- **Backend (movie-bff)** usa **Jest** ⬅️ TU TEST [B1]
- **Frontend (movie-webapp)** usa **Vitest**
- Ambos comparten el mismo Jenkins, pero pipelines separados

### Variables de Entorno Requeridas
\`\`\`env
NODE_ENV=test
OMDB_API_KEY=<tu-api-key>
DB_HOST=localhost
DB_PORT=5433
DB_NAME=movie_bff_db
DB_USER=movie_user
DB_PASSWORD=movie_password
\`\`\`

### Configuración de Jenkins Necesaria
1. **NodeJS Plugin** instalado
2. **NodeJS 20** configurado en Global Tool Configuration
3. **Docker Plugin** instalado (para stages de Docker)
4. **HTML Publisher Plugin** instalado (para coverage report)
5. **JUnit Plugin** instalado (viene por defecto)
6. **GitHub Plugin** instalado
7. **Credenciales** configuradas:
   - `github-credentials` (GitHub Personal Access Token)
   - `docker-hub-credentials` (Docker Hub username/password)

---

## 📅 Información del Issue

- **Issue:** #11
- **Estado:** 🟡 In Progress (Stand By esperando configuración de Manuel)
- **Fecha Inicio:** 13/11/2025
- **Última Actualización:** 13/11/2025
- **Branch:** `feature/integrante3-test-b1`
- **Pipeline:** `movie-bff-pipeline`

---

## 📚 Referencias

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Jenkins Pipeline Syntax](https://www.jenkins.io/doc/book/pipeline/syntax/)
- [ESLint TypeScript Guide](https://typescript-eslint.io/getting-started)

---

**✅ Preparado por:** @wilmereleon  
**📅 Fecha:** 13/11/2025  
**🏷️ Tags:** #backend #testing #jest #jenkins #typescript
