# monitoramento-covid19
Sistema de monitoramento de idosos pra prevenção de covid-19 em Natal/RN

## Server:
na pasta raiz execute
npm install para baixar as dependencias

configure o arquivo .env com as informações necessarias para usar a api do Google Cloud Platform e SMPT (envio de emails)
GOOGLE_PROJECT: nome do projeto
GOOGLE_APPLICATION_CREDENTIALS: caminho para o arquivo credentials.json
SMTP_HOST: endereço do servidor SMTP de envio de emails
SMTP_USER: usuário
SMTP_PASSWORD: senha

crie um banco de dados no mongo chamado 'planilhas'
dentro da pasta db tem alguns dados em json para serem inseridos no mongodb (collections usuarios e unidades)
todos os usuarios tem a senha 12345

rode o projeto executando 
npm run dev

o servidor roda em localhost:3000
a api está em localhost:3000/api

## Client:
na pasta /client execute
npm install ára baixar as dependências do frontend

em client/environment.js estão a configuração das variáveis de ambiente do projeto


### Project setup
```
npm install
```

#### Compiles and hot-reloads for development
o forntend roda em localhost:8080
```
npm run serve
```

#### Compiles and minifies for production
```
npm run build
```

#### Lints and fixes files
```
npm run lint
