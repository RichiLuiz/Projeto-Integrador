-- Comando para acessar a base de dados criada
use VanConecta
go

-- Inserção dos Perfis na tabela Users_Roles
Insert into Roles
values
(NEWID(), 'Administrador', ''),
(NEWID(), 'Motorista', ''),
(NEWID(), 'Responsavel', ''),
(NEWID(), 'Aluno', '')
go

  
-- Criação do Usuario Admin
Insert into Users (UserID, Username, CreateUser,RoleID)
values 
(NEWID(), 'Admin', 1,'4621C689-61EE-402D-8AD7-BE3DF8E99408')
go
 


--Inserção na tabela Relacao_Responsaveis
insert into Relacao_Responsaveis 
values ('mae')
       ,('avo')
       ,('tutor')
       ,('outro')
        ,('pai')
go


-- Select dos perfis, usuarios e relacao dos responsáveis
select * from Roles
go
select * from Users
go  
select * from Relacao_Responsaveis
