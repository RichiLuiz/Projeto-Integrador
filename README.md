# Projeto-Integrador
Aqui serão disponibilizados os arquivos do Projeto Integrador - VanConecta

## 📋 Sobre o Projeto
[Descrição do seu projeto aqui]

## 📁 Estrutura do Projeto

Projeto-Integrador/

├── README.md
│

├── database/

│   ├── schema.sql # Estrutura do banco de dados

│   ├── seeds.sql # Dados iniciais/exemplo

│

├── web/ # Frontend

│    ├── index.html # Página principal

│    ├── cadastro-motorista.html # Página Cadastro Motorista

│    ├── cadastro-responsavel.html # Página Cadastro responsavel

│    ├── motorista-dashboard.html

│    ├── responsavel-dashboard.html

│    ├── login.js

│    ├── main.js

│    ├── motorista.js

│    ├── responsavel.js

│    ├── style.css

│

├── api/ # Backend

│   ├── server.js

│   ├──db.js

│   └── routes/ # Rotas da API

│   │   ├── auth.js

│   │   ├── motoristas.js

│   │   ├── motoristaDashboard.js

│   │   ├── responsaveis.js

│   │   ├── responsaveisDashboard.js





## 🚀 Como executar

### Banco de Dados
1. Execute o script `database/schema.sql` Utilizado SQL Server
2. (Opcional) Execute `database/seeds.sql` para dados de exemplo

### Frontend
1. Abra o arquivo `web/index.html` no navegador

### Backend
```bash
cd api
npm install
npm install express
npm install cors
npm install mssql
npm install bcrypt
npm install uuid
npm install cpf-cnpj-validator
npm install dotenv
npm start

node server.js
