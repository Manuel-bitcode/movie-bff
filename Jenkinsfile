pipeline {
    agent any

    tools {
        nodejs 'NodeJS-20'
    }

    environment {
        DOCKER_IMAGE = 'movie-bff'
        NODE_ENV = 'test'
        DOCKER_IMAGE_NAME = 'movie-bff'
        DOCKER_TAG = "${env.BRANCH_NAME.replaceAll('/', '-')}-${env.BUILD_NUMBER}"
        DOCKER_REGISTRY = 'docker.io'
        DOCKER_HUB_REPO = 'wilmerleon/movie-bff'
        OMDB_API_KEY = '720c3666'
    }

    stages {
        stage('Checkout') {
            steps {
                echo '📦 Clonando repositorio...'
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo '📚 Instalando dependencias de Node.js...'
                sh 'node --version'
                sh 'npm --version'
                sh 'npm ci'
            }
        }

        stage('Lint') {
            steps {
                echo '🔍 Ejecutando linter...'
                sh 'npm run lint'
            }
        }

        stage('Test') {
            steps {
                echo '🧪 Ejecutando tests en entorno reproducible (docker-compose)...'
                sh './scripts/ci/run-tests-ci.sh'
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: 'junit.xml'
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

        stage('Build') {
            steps {
                echo '🏗️ Compilando TypeScript...'
                sh 'npm run build'
            }
        }

        stage('Build Docker Image') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                    branch pattern: 'feature/.*', comparator: 'REGEXP'
                }
            }
            steps {
                echo '🐳 Construyendo imagen Docker...'
                sh "docker build -t ${DOCKER_IMAGE_NAME}:${DOCKER_TAG} ."
            }
        }

        stage('Push to Docker Hub') {
            when { branch 'main' }
            steps {
                echo '🚀 Publicando imagen en Docker Hub...'
                withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                    sh "docker push ${DOCKER_HUB_REPO}:${DOCKER_TAG}"
                    sh "docker tag ${DOCKER_HUB_REPO}:${DOCKER_TAG} ${DOCKER_HUB_REPO}:latest"
                    sh "docker push ${DOCKER_HUB_REPO}:latest"
                }
            }
        }

        stage('Deploy') {
            when { branch 'main' }
            steps {
                echo '🚀 Desplegando aplicación...'
                sh 'docker-compose down || true'
                sh 'docker-compose up -d --build'
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline ejecutado exitosamente'
            echo "Branch: ${env.BRANCH_NAME}"
            echo "Build: ${env.BUILD_NUMBER}"
        }
        failure {
            echo '❌ Pipeline falló. Revisar logs.'
        }
        always {
            echo '🧹 Limpiando workspace...'
            cleanWs()
        }
    }
}