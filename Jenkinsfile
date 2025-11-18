pipeline {
    agent any

    environment {
        NODE_HOME = tool name: 'NodeJs25', type: 'nodejs' // Ajusta según tu instalación de NodeJS en Jenkins
        PATH = "${NODE_HOME}/bin:${env.PATH}"
    }

    stages {
        stage('Checkout Code') {
            steps {
                // Apunta a la rama feature que quieres probar
                git branch: 'feature/integrante4-test-b2', 
                    url: 'https://github.com/Manuel-bitcode/movie-bff.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'npm test'
            }
        }
    }

    post {
        always {
            echo "Pipeline finalizado"
        }
        success {
            echo "¡Tests pasaron correctamente! ✅"
        }
        failure {
            echo "Algunos tests fallaron ❌"
        }
    }
}
