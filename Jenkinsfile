pipeline {pipeline {

    agent any    agent any

        

    tools {    tools {

        nodejs 'NodeJS-20' // Debe estar configurado en Jenkins Global Tool Configuration        nodejs 'NodeJS-20'

    }    }

        

    environment {    environment {

        // Variables de entorno para el proyecto        DOCKER_IMAGE = 'movie-bff'

        NODE_ENV = 'test'        // Reemplazar / por - en el nombre de rama para Docker tag válido

        DOCKER_IMAGE_NAME = 'movie-bff'        DOCKER_TAG = "${env.BRANCH_NAME.replaceAll('/', '-')}-${env.BUILD_NUMBER}"

        DOCKER_REGISTRY = 'docker.io'        DOCKER_HUB_REPO = 'wilmerleon/movie-bff'

    }        NODE_ENV = 'test'

            OMDB_API_KEY = '720c3666'

    stages {    }

        stage('Checkout') {    

            steps {    stages {

                echo '📦 Clonando repositorio...'        stage('Checkout') {

                checkout scm            steps {

                sh 'git log -1 --pretty=format:"%h - %an: %s"'                echo '🔄 Clonando repositorio...'

            }                checkout scm

        }            }

                }

        stage('Install Dependencies') {        

            steps {        stage('Install Dependencies') {

                echo '📚 Instalando dependencias de Node.js...'            steps {

                sh 'node --version'                echo '📦 Instalando dependencias...'

                sh 'npm --version'                sh 'npm install'

                sh 'npm ci' // Instalación limpia y reproducible            }

            }        }

        }        

                stage('Lint') {

        stage('Lint') {            steps {

            steps {                echo '🔍 Ejecutando linter...'

                echo '🔍 Ejecutando ESLint...'                sh 'npm run lint'

                sh 'npm run lint'            }

            }        }

        }        

                stage('Test') {

        stage('Build') {            steps {

            steps {                echo '🧪 Ejecutando tests...'

                echo '🏗️ Compilando TypeScript...'                sh 'npm test -- --coverage --ci'

                sh 'npm run build'            }

                sh 'ls -la dist/' // Verificar que se generó el código compilado            post {

            }                always {

        }                    // Publicar resultados de tests

                            junit allowEmptyResults: true, testResults: 'junit.xml'

        stage('Test') {                    

            steps {                    // Publicar reporte de coverage

                echo '🧪 Ejecutando tests con Jest...'                    publishHTML([

                sh 'npm test'                        allowMissing: true,

            }                        alwaysLinkToLastBuild: true,

            post {                        keepAll: true,

                always {                        reportDir: 'coverage/lcov-report',

                    // Publicar resultados de tests (si Jest genera junit.xml)                        reportFiles: 'index.html',

                    junit allowEmptyResults: true, testResults: 'junit.xml'                        reportName: 'Coverage Report'

                                        ])

                    // Publicar reporte de coverage (si está configurado)                }

                    publishHTML([            }

                        allowMissing: true,        }

                        alwaysLinkToLastBuild: true,        

                        keepAll: true,        stage('Build') {

                        reportDir: 'coverage/lcov-report',            steps {

                        reportFiles: 'index.html',                echo '🏗️ Compilando TypeScript...'

                        reportName: 'Coverage Report'                sh 'npm run build'

                    ])            }

                }        }

            }        

        }        stage('Build Docker Image') {

                    when {

        stage('Docker Build') {                anyOf {

            when {                    branch 'main'

                // Solo construir imagen Docker en rama main o develop                    branch 'develop'

                anyOf {                    branch pattern: 'feature/.*', comparator: 'REGEXP'

                    branch 'main'                }

                    branch 'develop'            }

                }            steps {

            }                echo '🐳 Construyendo imagen Docker...'

            steps {                script {

                echo '🐳 Construyendo imagen Docker...'                    sh "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} ."

                script {                }

                    def imageTag = "${env.BRANCH_NAME}-${env.BUILD_NUMBER}"            }

                    sh "docker build -t ${DOCKER_IMAGE_NAME}:${imageTag} ."        }

                    sh "docker tag ${DOCKER_IMAGE_NAME}:${imageTag} ${DOCKER_IMAGE_NAME}:latest"        

                }        stage('Push to Docker Hub') {

            }            when {

        }                branch 'main'

                    }

        stage('Docker Push') {            steps {

            when {                echo '🚀 Publicando imagen en Docker Hub...'

                branch 'main'                script {

            }                    docker.withRegistry('https://registry.hub.docker.com', 'docker-credentials') {

            steps {                        sh "docker push ${DOCKER_HUB_REPO}:${DOCKER_TAG}"

                echo '📤 Subiendo imagen a Docker Registry...'                        sh "docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_HUB_REPO}:latest"

                script {                        sh "docker push ${DOCKER_HUB_REPO}:latest"

                    // Requiere credenciales configuradas en Jenkins                    }

                    withCredentials([usernamePassword(                }

                        credentialsId: 'docker-hub-credentials',            }

                        usernameVariable: 'DOCKER_USER',        }

                        passwordVariable: 'DOCKER_PASS'        

                    )]) {        stage('Deploy') {

                        sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'            when {

                        sh "docker push ${DOCKER_IMAGE_NAME}:latest"                branch 'main'

                    }            }

                }            steps {

            }                echo '🚀 Desplegando aplicación...'

        }                sh '''

                            docker-compose down || true

        stage('Deploy') {                    docker-compose up -d --build

            when {                '''

                branch 'main'            }

            }        }

            steps {    }

                echo '🚀 Desplegando a producción...'    

                // Aquí irían los comandos de despliegue    post {

                sh 'echo "Deploy step - configurar según ambiente"'        success {

            }            echo '✅ Pipeline ejecutado exitosamente'

        }            echo "Branch: ${env.BRANCH_NAME}"

    }            echo "Build: ${env.BUILD_NUMBER}"

            }

    post {        failure {

        success {            echo '❌ Pipeline falló'

            echo '✅ Pipeline ejecutado exitosamente!'            echo "Revisa los logs para más detalles"

            // Notificaciones opcionales (Slack, email, etc.)        }

        }    }

        failure {}

            echo '❌ Pipeline falló. Revisar logs.'
        }
        always {
            echo '🧹 Limpiando workspace...'
            cleanWs()
        }
    }
}
