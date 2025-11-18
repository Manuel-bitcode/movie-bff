pipeline {
    agent any

    tools {
        git 'Default'       // Asegúrate que Git esté configurado en Jenkins con este nombre
        nodejs 'NodeJs25'     // Si tienes configurado NodeJS en Jenkins Global Tool Config
    }

    environment {
        NODE_ENV = 'test'
    }

    stages {
        stage('Checkout Code') {
            steps {
                echo "Checkout branch feature/integrante4-test-b2"
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: 'refs/heads/feature/integrante4-test-b2']],
                    doGenerateSubmoduleConfigurations: false,
                    extensions: [],
                    userRemoteConfigs: [[
                        url: 'https://github.com/Manuel-bitcode/movie-bff.git',
                        credentialsId: '' // Dejar vacío si tu repo es público
                    ]]
                ])
            }
        }

        stage('Install Dependencies') {
            steps {
                echo "Installing npm dependencies"
                sh 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                echo "Running Jest tests"
                sh 'npm test'
            }
        }

        stage('Build TypeScript') {
            steps {
                echo "Building TypeScript"
                sh 'npm run build'
            }
        }
    }

    post {
        success {
            echo 'Pipeline finalizado con éxito ✅'
        }
        failure {
            echo 'Pipeline falló ❌'
        }
        always {
            echo 'Pipeline terminado'
        }
    }
}
