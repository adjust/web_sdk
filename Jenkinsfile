#!groovy

pipeline {
  tools {
    nodejs 'nodejs_20.11.1'
  }
  agent {
    node {
      label 'new'
    }
  }
  stages {
    stage('Setup') {
      when {
        branch "master"
      }

      steps {
        sh "npm ci"
      }
    }

    stage('Build Production') {
      when {
        branch "master"
      }

      steps {
        sh "npm run clean"
        sh "npm run build:demo"
      }
    }
    stage('Deploy Production') {
      when {
        branch "master"
      }

      steps {
        sh "rsync -e 'ssh -o StrictHostKeyChecking=no' -va --rsync-path='mkdir -p /home/dashboard/web-sdk-demo/current/public/ && rsync' --delete ./demo/ dashboard@jenkins-2.adjust.com://home/dashboard/web-sdk-demo/current/public/"
      }
    }
  }
  post {
    always {
      cleanWs()
    }
  }
}
