# monitoramento-covid19
Backend do Sistema de monitoramento de idosos pra prevenção de covid-19 em Natal/RN

npm install para baixar as dependencias

configure o arquivo .env com as informações necessarias para usar a api do Google Cloud Platform
GOOGLE_PROJECT: nome do projeto
GOOGLE_APPLICATION_CREDENTIALS: caminho para o arquivo credentials.json

crie um banco de dados no mongo chamado 'planilhas'
dentro da pasta db tem alguns dados em json para serem inseridos no mongodb (collections usuarios e unidades)
todos os usuarios tem a senha 12345

rode o projeto executando npm run dev