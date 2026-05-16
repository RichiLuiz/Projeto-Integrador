
/* processo para dropar a base caso necessario
use master
go
drop database VanConecta
*/
--Criação da Base de dados
Create Database VanConecta
go

-- Comando para acessar a base de dados criada
Use VanConecta
go

-- Criação da tabela de Perfis
Create table Roles
(
RoleID uniqueidentifier primary key, -- uniqueidentifier identificador unico Global
Rolename varchar(100) not null,
[Description] varchar(255) null
)
go


-- Criação da tabela de usuários
Create table Users
(
UserID uniqueidentifier primary key, -- uniqueidentifier identificador unico Global
Username varchar(100) not null,
LastActivityDate datetime default getdate(), --Coluna que identifica o ultimo horario de atividade/login do usuario. Usado Default getdate() pegar a data e hora da criação do usuario.
CreateUser bit default 0, -- coluna do tipo bit, que identifica se o usuario pode criar outros usuarios. Default 0 para não criar usuarios.
RoleID uniqueidentifier, -- RoleID como chave estrangeira para identificar a qual o tipo de Perfil do usuario 
CONSTRAINT fk_RoleID FOREIGN KEY (RoleID) REFERENCES Roles(RoleID)
)


-- Criação da tabela checkin checkout, 1 registro por checkin ou checkout do aluno.
Create table Location_Record 
(
Location_Record_ID bigint identity (1,1) primary key, -- Identificador do registro de checkin/checkout, sempre irá adicionar 1 quando houver um novo checkin ou checkout.
UserID_Motorista uniqueidentifier not null,  -- uniqueidentifier identificador unico Global
Latitude varchar(100) not null, 
Longitude varchar(100) not null,
LocationDescription varchar(200), --Coluna para algum tipo de identificação futura, por exemplo marcar que foi na RUA X que o Aluno desembarcou
CheckType varchar(10) not null, -- Identificará se é checkin ou checkout
RegisterDate datetime default getdate(), -- Default getdate() para que assim que o registro seja inserido a data e hora seja registrada
UserID_Aluno uniqueidentifier not null, 
Other_Descriptions varchar(200), -- Coluna para deixar alguma anotação, caso necessario.

CONSTRAINT fk_UserID_Motorista FOREIGN KEY (UserID_Motorista) REFERENCES Users(UserID),
CONSTRAINT chk_CheckType CHECK (CheckType in ('checkin','checkout')), -- Só deixa salvar 'checkin' ou 'checkout', não pode ser qualquer outro dado.
CONSTRAINT fk_UserID_Aluno FOREIGN KEY (UserID_Aluno) REFERENCES Users(UserID)
)
go

  
-- Criação da tabela com os detalhes do motorista, ainda estou mexendo
Create table Motoristas (
ID_Motorista int identity(1,1) primary key , 
UserID uniqueidentifier not null,
NomeMotorista varchar(200) not null,
CPF char (14) not null,
Contato1 varchar(20) not null,
Contato2 varchar(20) null,
Contato3 varchar(20) null,
CNH VARCHAR(20)   NOT NULL UNIQUE,
Categoria_CNH CHAR(2) NOT NULL,         -- Ex: B, D
Validade_CNH DATE NOT NULL,
RegiaoAtuacao bigint,
Email varchar (100) not null,
TempoExperiencia tinyint not null,
Ativo BIT NOT NULL DEFAULT 1,
CreatedDate DATETIME NOT NULL DEFAULT GETDATE()

CONSTRAINT fk_Motorista_UserID FOREIGN KEY (UserID) REFERENCES Users(UserID)
)
go

  
-- Criação da tabela Veiculos
Create table Veiculos (
ID_Veiculo int identity(1,1) primary key,
ID_Motorista int,
Placa varchar(8) not null,
Capacidade int not null,
Modelo varchar (50) not null,
Ano_Veiculo date not null,
Regiao varchar(Max)  not null,
ID_Regiao_Atuacao int null,
Observacoes varchar(max)  not null,
CONSTRAINT chk_Ano_Veiculo CHECK (Ano_Veiculo >= '1990-01-01' and Ano_Veiculo<= getdate()),
CONSTRAINT fk_ID_Motorista FOREIGN KEY (ID_Motorista) REFERENCES Motoristas(ID_Motorista)
)
go

-- Criação da tabela Responsavel
CREATE TABLE Responsaveis (
    ID_Responsavel  INT IDENTITY(1,1) PRIMARY KEY,
	UserID uniqueidentifier not null,
    Nome VARCHAR(200)NOT NULL,
    cpf CHAR(11)NOT NULL UNIQUE,
    Contato1 varchar(20)	not null,
	Contato2 varchar(20)	null,
	Contato3 varchar(20)	null,
    Email VARCHAR(100)NULL,
    Endereco VARCHAR(200)NOT NULL,
    Ativo BIT NOT NULL DEFAULT 1,
    CreatedDate    DATETIME	NOT NULL DEFAULT GETDATE(),
	
CONSTRAINT fk_Responsavel_UserID FOREIGN KEY (UserID) REFERENCES Users(UserID)
)
go

  
-- Criação da tabela Aluno
CREATE TABLE Aluno (
    ID_Aluno INT IDENTITY(1,1) PRIMARY KEY,
    ID_Responsavel INT NOT NULL,
    ID_Motorista INT NOT NULL,
    Nome VARCHAR(100) NOT NULL,
    Data_Nascimento DATE NOT NULL,
    Escola VARCHAR(100) NOT NULL,
    Turno VARCHAR(10)  NOT NULL CHECK (turno IN ('Manha', 'Tarde', 'Noite')),
    Ponto_embarque    VARCHAR(200) NOT NULL,
    Ponto_desembarque VARCHAR(200) NOT NULL,
    Ativo BIT NOT NULL DEFAULT 1,
    CreatedDate DATETIME NOT NULL DEFAULT GETDATE(),
	ID_Relacao int not null,
    CONSTRAINT FK_Aluno_Responsavel
        FOREIGN KEY (ID_Responsavel) REFERENCES Responsaveis(ID_Responsavel),

    CONSTRAINT FK_Aluno_Motorista
        FOREIGN KEY (ID_Motorista)   REFERENCES Motoristas(ID_Motorista),
		
    CONSTRAINT FK_Relacao_Responsavel
        FOREIGN KEY (ID_Relacao)   REFERENCES Relacao_Responsaveis(ID_Relacao)
)
go


--Criação da tabela de relação aluno, precisa estar no aluno
Create table Relacao_Responsaveis
(
ID_Relacao INT IDENTITY(1,1) PRIMARY KEY,
Relacao varchar(50),
)
go
