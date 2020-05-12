#!groovy

pipeline {
  agent {
    node {
      label 'new'
    }
  }
  stages {
    stage('Setup') {
      steps {
        sh "npm install"
      }
     }
    stage('Test') {
      steps {
        sh "npm run test:all"
      }
    }
    stage('Build Production') {
      steps {
        sh "npm run clean"
        sh "npm run build:demo"
      }
    }
    stage('Deploy Production') {
      steps {
        sh "rsync -e 'ssh -o StrictHostKeyChecking=no' -va --delete ./demo/ dashboard@jenkins-2.adjust.com:/home/dashboard/web-sdk-demo/current/public"
      }
    }
  }
  post {
    always {
      cleanWs()
    }
  }
}
