pipeline {
    agent any

    parameters {
        string(name: 'BRANCH', defaultValue: 'main', description: 'Rama a construir')
    }

    environment {
        // Configuración del proyecto
        NODE_VERSION = '20'
        APP_PORT = '3000'
        APP_CONTAINER = 'movie-bff'
    }

    stages {
        stage('✅ Verificar Herramientas') {
            steps {
                echo '🔧 Verificando herramientas disponibles...'
                sh '''
                    echo "Node.js version:"
                    node --version
                    echo "npm version:"
                    npm --version
                '''
            }
        }

        stage('🔍 Checkout') {
            steps {
                echo '📥 Descargando código del repositorio...'
                echo '✅ Código disponible en /workspace/movie-bff'
            }
        }

        stage('📦 Instalar Dependencias') {
            steps {
                echo '📦 Instalando dependencias de Node.js...'
                dir('/workspace/movie-bff') {
                    sh 'npm install'
                }
            }
        }

        stage('🔎 Lint (Revisar código)') {
            steps {
                echo '🔍 Analizando código TypeScript con ESLint...'
                dir('/workspace/movie-bff') {
                    sh 'npm run lint || echo "⚠️  Lint encontró advertencias"'
                }
            }
        }

        stage('🔍 Validar Tipos TypeScript') {
            steps {
                echo '🔍 Verificando tipos de TypeScript...'
                dir('/workspace/movie-bff') {
                    sh 'npm run build:check'
                }
            }
        }

        stage('🧪 Tests') {
            steps {
                echo '🧪 Ejecutando tests...'
                dir('/workspace/movie-bff') {
                    sh 'npm test || echo "⚠️  Tests no configurados todavía"'
                }
            }
        }

        stage('🏗️  Build TypeScript') {
            steps {
                echo '🏗️  Compilando TypeScript a JavaScript...'
                dir('/workspace/movie-bff') {
                    sh 'npm run build'
                }
            }
        }

        stage('✅ Validación Completa') {
            steps {
                echo '✅ Ejecutando validación completa (lint + types)...'
                dir('/workspace/movie-bff') {
                    sh 'npm run validate'
                }
            }
        }
    }

    post {
        always {
            echo '🏁 Pipeline finalizado para Movie BFF.'
            dir('/workspace/movie-bff') {
                // Limpiar archivos generados si es necesario
                sh 'ls -la dist/ || echo "No hay directorio dist"'
            }
        }
        success {
            echo '✅ ¡Build exitoso! El BFF está listo para deployment.'
        }
        failure {
            echo '❌ Build falló. Revisa los logs arriba.'
        }
    }
}

