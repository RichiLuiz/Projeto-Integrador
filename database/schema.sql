
/* processo para dropar a base caso necessario
use master
go
drop database VanConecta
*/


--Criação da Base de dados
Create Database VanConecta
go

	
-- Comando para acessar a base de dados criada
use VanConecta
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
Username varchar(100) not null unique, -- 
LastActivityDate datetime default getdate(), --Coluna que identifica o ultimo horario de atividade/login do usuario. Usado Default getdate() pegar a data e hora da criação do usuario.
CreateUser bit default 0, -- coluna do tipo bit, que identifica se o usuario pode criar outros usuarios. Default 0 para não criar usuarios.
RoleID uniqueidentifier, -- RoleID como chave estrangeira para identificar a qual o tipo de Perfil do usuario 
PasswordHash VARCHAR(255),
CONSTRAINT fk_RoleID FOREIGN KEY (RoleID) REFERENCES Roles(RoleID)
)
go


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
    cpf CHAR(14)NOT NULL UNIQUE,
    Contato1 varchar(20)	not null,
	Contato2 varchar(20)	null,
	Contato3 varchar(20)	null,
    Email VARCHAR(100)	NULL,
    Endereco VARCHAR(200)NOT NULL,
	Numero varchar(50) not null,
	CEP varchar(50) not null,
    Ativo BIT NOT NULL DEFAULT 1,
    CreatedDate    DATETIME	NOT NULL DEFAULT GETDATE(),
	
CONSTRAINT fk_Responsavel_UserID FOREIGN KEY (UserID) REFERENCES Users(UserID)
)
go

	
-- Criação da tabela Aluno
CREATE TABLE Aluno (
    ID_Aluno INT IDENTITY(1,1) PRIMARY KEY,
    ID_Responsavel INT NOT NULL,
    ID_Motorista INT  NULL,
    Nome VARCHAR(100) NOT NULL,
    Data_Nascimento DATE NOT NULL,
    Escola VARCHAR(100) NOT NULL,
	ID_Escola int null,
    Turno VARCHAR(10)  NOT NULL CHECK (turno IN ('Manha', 'Tarde', 'Noite')),
    Ponto_embarque    VARCHAR(200) NOT NULL,
    Ponto_desembarque VARCHAR(200) NOT NULL,
    Ativo BIT NOT NULL DEFAULT 1,
    CreatedDate DATETIME NOT NULL DEFAULT GETDATE(),
	ID_Relacao int not null,
	observacao varchar(max),
	 necessidadeespecial bit,
    CONSTRAINT FK_Aluno_Responsavel
        FOREIGN KEY (ID_Responsavel) REFERENCES Responsaveis(ID_Responsavel),

		
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


--Criação da tabela do Censo Escolar 2025, baixado do https://www.gov.br/inep/pt-br/areas-de-atuacao/pesquisas-estatisticas-e-indicadores/censo-escolar/resultados "2025, Microdados da Educação Básica 2025".
--Com essas informações facilita a procura por escola e na criação das rotas
CREATE TABLE [dbo].[Importa_Censo_2025](
	[NU_ANO_CENSO] [varchar](500) NULL,
	[NO_REGIAO] [varchar](500) NULL,
	[CO_REGIAO] [varchar](500) NULL,
	[NO_UF] [varchar](500) NULL,
	[SG_UF] [varchar](500) NULL,
	[CO_UF] [varchar](500) NULL,
	[NO_MUNICIPIO] [varchar](500) NULL,
	[CO_MUNICIPIO] [varchar](500) NULL,
	[NO_REGIAO_GEOG_INTERM] [varchar](500) NULL,
	[CO_REGIAO_GEOG_INTERM] [varchar](500) NULL,
	[NO_REGIAO_GEOG_IMED] [varchar](500) NULL,
	[CO_REGIAO_GEOG_IMED] [varchar](500) NULL,
	[NO_MESORREGIAO] [varchar](500) NULL,
	[CO_MESORREGIAO] [varchar](500) NULL,
	[NO_MICRORREGIAO] [varchar](500) NULL,
	[CO_MICRORREGIAO] [varchar](500) NULL,
	[NO_DISTRITO] [varchar](500) NULL,
	[CO_DISTRITO] [varchar](500) NULL,
	[NO_REGIAO_ADMINISTRATIVA] [varchar](500) NULL,
	[CO_REGIAO_ADMINISTRATIVA] [varchar](500) NULL,
	[NO_ENTIDADE] [varchar](500) NULL,
	[CO_ENTIDADE] [varchar](500) NULL,
	[TP_DEPENDENCIA] [varchar](500) NULL,
	[TP_CATEGORIA_ESCOLA_PRIVADA] [varchar](500) NULL,
	[TP_LOCALIZACAO] [varchar](500) NULL,
	[TP_LOCALIZACAO_DIFERENCIADA] [varchar](500) NULL,
	[DS_ENDERECO] [varchar](500) NULL,
	[NU_ENDERECO] [varchar](500) NULL,
	[DS_COMPLEMENTO] [varchar](500) NULL,
	[NO_BAIRRO] [varchar](500) NULL,
	[CO_CEP] [varchar](500) NULL,
	[NU_DDD] [varchar](500) NULL,
	[NU_TELEFONE] [varchar](500) NULL,
	[LATITUDE] [varchar](500) NULL,
	[LONGITUDE] [varchar](500) NULL,
	[TP_SITUACAO_FUNCIONAMENTO] [varchar](500) NULL,
	[CO_ORGAO_REGIONAL] [varchar](500) NULL,
	[DT_ANO_LETIVO_INICIO] [varchar](500) NULL,
	[DT_ANO_LETIVO_TERMINO] [varchar](500) NULL,
	[IN_VINCULO_SECRETARIA_EDUCACAO] [varchar](500) NULL,
	[IN_VINCULO_SEGURANCA_PUBLICA] [varchar](500) NULL,
	[IN_VINCULO_SECRETARIA_SAUDE] [varchar](500) NULL,
	[IN_VINCULO_OUTRO_ORGAO] [varchar](500) NULL,
	[IN_PODER_PUBLICO_PARCERIA] [varchar](500) NULL,
	[TP_PODER_PUBLICO_PARCERIA] [varchar](500) NULL,
	[IN_FORMA_CONT_TERMO_COLABORA] [varchar](500) NULL,
	[IN_FORMA_CONT_TERMO_FOMENTO] [varchar](500) NULL,
	[IN_FORMA_CONT_ACORDO_COOP] [varchar](500) NULL,
	[IN_FORMA_CONT_PRESTACAO_SERV] [varchar](500) NULL,
	[IN_FORMA_CONT_COOP_TEC_FIN] [varchar](500) NULL,
	[IN_FORMA_CONT_CONSORCIO_PUB] [varchar](500) NULL,
	[IN_FORMA_CONT_MU_TERMO_COLAB] [varchar](500) NULL,
	[IN_FORMA_CONT_MU_TERMO_FOMENTO] [varchar](500) NULL,
	[IN_FORMA_CONT_MU_ACORDO_COOP] [varchar](500) NULL,
	[IN_FORMA_CONT_MU_PREST_SERV] [varchar](500) NULL,
	[IN_FORMA_CONT_MU_COOP_TEC_FIN] [varchar](500) NULL,
	[IN_FORMA_CONT_MU_CONSORCIO_PUB] [varchar](500) NULL,
	[IN_FORMA_CONT_ES_TERMO_COLAB] [varchar](500) NULL,
	[IN_FORMA_CONT_ES_TERMO_FOMENTO] [varchar](500) NULL,
	[IN_FORMA_CONT_ES_ACORDO_COOP] [varchar](500) NULL,
	[IN_FORMA_CONT_ES_PREST_SERV] [varchar](500) NULL,
	[IN_FORMA_CONT_ES_COOP_TEC_FIN] [varchar](500) NULL,
	[IN_FORMA_CONT_ES_CONSORCIO_PUB] [varchar](500) NULL,
	[IN_MANT_ESCOLA_PRIVADA_EMP] [varchar](500) NULL,
	[IN_MANT_ESCOLA_PRIVADA_ONG] [varchar](500) NULL,
	[IN_MANT_ESCOLA_PRIVADA_OSCIP] [varchar](500) NULL,
	[IN_MANT_ESCOLA_PRIV_ONG_OSCIP] [varchar](500) NULL,
	[IN_MANT_ESCOLA_PRIVADA_SIND] [varchar](500) NULL,
	[IN_MANT_ESCOLA_PRIVADA_SIST_S] [varchar](500) NULL,
	[IN_MANT_ESCOLA_PRIVADA_S_FINS] [varchar](500) NULL,
	[NU_CNPJ_ESCOLA_PRIVADA] [varchar](500) NULL,
	[NU_CNPJ_MANTENEDORA] [varchar](500) NULL,
	[TP_REGULAMENTACAO] [varchar](500) NULL,
	[TP_RESPONSAVEL_REGULAMENTACAO] [varchar](500) NULL,
	[CO_ESCOLA_SEDE_VINCULADA] [varchar](500) NULL,
	[CO_IES_OFERTANTE] [varchar](500) NULL,
	[IN_LOCAL_FUNC_PREDIO_ESCOLAR] [varchar](500) NULL,
	[TP_OCUPACAO_PREDIO_ESCOLAR] [varchar](500) NULL,
	[IN_LOCAL_FUNC_SOCIOEDUCATIVO] [varchar](500) NULL,
	[IN_LOCAL_FUNC_UNID_PRISIONAL] [varchar](500) NULL,
	[IN_LOCAL_FUNC_PRISIONAL_SOCIO] [varchar](500) NULL,
	[IN_LOCAL_FUNC_GALPAO] [varchar](500) NULL,
	[TP_OCUPACAO_GALPAO] [varchar](500) NULL,
	[IN_LOCAL_FUNC_SALAS_OUTRA_ESC] [varchar](500) NULL,
	[IN_LOCAL_FUNC_OUTROS] [varchar](500) NULL,
	[IN_PREDIO_COMPARTILHADO] [varchar](500) NULL,
	[IN_AGUA_POTAVEL] [varchar](500) NULL,
	[IN_AGUA_REDE_PUBLICA] [varchar](500) NULL,
	[IN_AGUA_POCO_ARTESIANO] [varchar](500) NULL,
	[IN_AGUA_CACIMBA] [varchar](500) NULL,
	[IN_AGUA_FONTE_RIO] [varchar](500) NULL,
	[IN_AGUA_INEXISTENTE] [varchar](500) NULL,
	[IN_AGUA_CARRO_PIPA] [varchar](500) NULL,
	[IN_ENERGIA_REDE_PUBLICA] [varchar](500) NULL,
	[IN_ENERGIA_GERADOR_FOSSIL] [varchar](500) NULL,
	[IN_ENERGIA_RENOVAVEL] [varchar](500) NULL,
	[IN_ENERGIA_INEXISTENTE] [varchar](500) NULL,
	[IN_ESGOTO_REDE_PUBLICA] [varchar](500) NULL,
	[IN_ESGOTO_FOSSA_SEPTICA] [varchar](500) NULL,
	[IN_ESGOTO_FOSSA_COMUM] [varchar](500) NULL,
	[IN_ESGOTO_FOSSA] [varchar](500) NULL,
	[IN_ESGOTO_INEXISTENTE] [varchar](500) NULL,
	[IN_LIXO_SERVICO_COLETA] [varchar](500) NULL,
	[IN_LIXO_QUEIMA] [varchar](500) NULL,
	[IN_LIXO_ENTERRA] [varchar](500) NULL,
	[IN_LIXO_DESTINO_FINAL_PUBLICO] [varchar](500) NULL,
	[IN_LIXO_DESCARTA_OUTRA_AREA] [varchar](500) NULL,
	[IN_TRATAMENTO_LIXO_SEPARACAO] [varchar](500) NULL,
	[IN_TRATAMENTO_LIXO_REUTILIZA] [varchar](500) NULL,
	[IN_TRATAMENTO_LIXO_RECICLAGEM] [varchar](500) NULL,
	[IN_TRATAMENTO_LIXO_INEXISTENTE] [varchar](500) NULL,
	[IN_ALMOXARIFADO] [varchar](500) NULL,
	[IN_AREA_VERDE] [varchar](500) NULL,
	[IN_AREA_PLANTIO] [varchar](500) NULL,
	[IN_AUDITORIO] [varchar](500) NULL,
	[IN_BANHEIRO] [varchar](500) NULL,
	[IN_BANHEIRO_EI] [varchar](500) NULL,
	[IN_BANHEIRO_PNE] [varchar](500) NULL,
	[IN_BANHEIRO_FUNCIONARIOS] [varchar](500) NULL,
	[IN_BANHEIRO_CHUVEIRO] [varchar](500) NULL,
	[IN_BIBLIOTECA] [varchar](500) NULL,
	[IN_BIBLIOTECA_SALA_LEITURA] [varchar](500) NULL,
	[IN_COZINHA] [varchar](500) NULL,
	[IN_DESPENSA] [varchar](500) NULL,
	[IN_DORMITORIO_ALUNO] [varchar](500) NULL,
	[IN_DORMITORIO_PROFESSOR] [varchar](500) NULL,
	[IN_LABORATORIO_CIENCIAS] [varchar](500) NULL,
	[IN_LABORATORIO_INFORMATICA] [varchar](500) NULL,
	[IN_LABORATORIO_EDUC_PROF] [varchar](500) NULL,
	[IN_PATIO_COBERTO] [varchar](500) NULL,
	[IN_PATIO_DESCOBERTO] [varchar](500) NULL,
	[IN_PARQUE_INFANTIL] [varchar](500) NULL,
	[IN_PISCINA] [varchar](500) NULL,
	[IN_QUADRA_ESPORTES] [varchar](500) NULL,
	[IN_QUADRA_ESPORTES_COBERTA] [varchar](500) NULL,
	[IN_QUADRA_ESPORTES_DESCOBERTA] [varchar](500) NULL,
	[IN_REFEITORIO] [varchar](500) NULL,
	[IN_SALA_ATELIE_ARTES] [varchar](500) NULL,
	[IN_SALA_MUSICA_CORAL] [varchar](500) NULL,
	[IN_SALA_ESTUDIO_DANCA] [varchar](500) NULL,
	[IN_SALA_MULTIUSO] [varchar](500) NULL,
	[IN_SALA_ESTUDIO_GRAVACAO] [varchar](500) NULL,
	[IN_SALA_OFICINAS_EDUC_PROF] [varchar](500) NULL,
	[IN_SALA_DIRETORIA] [varchar](500) NULL,
	[IN_SALA_LEITURA] [varchar](500) NULL,
	[IN_SALA_PROFESSOR] [varchar](500) NULL,
	[IN_SALA_REPOUSO_ALUNO] [varchar](500) NULL,
	[IN_SECRETARIA] [varchar](500) NULL,
	[IN_SALA_ATENDIMENTO_ESPECIAL] [varchar](500) NULL,
	[IN_TERREIRAO] [varchar](500) NULL,
	[IN_VIVEIRO] [varchar](500) NULL,
	[IN_DEPENDENCIAS_OUTRAS] [varchar](500) NULL,
	[IN_ACESSIBILIDADE_CORRIMAO] [varchar](500) NULL,
	[IN_ACESSIBILIDADE_ELEVADOR] [varchar](500) NULL,
	[IN_ACESSIBILIDADE_PISOS_TATEIS] [varchar](500) NULL,
	[IN_ACESSIBILIDADE_VAO_LIVRE] [varchar](500) NULL,
	[IN_ACESSIBILIDADE_RAMPAS] [varchar](500) NULL,
	[IN_ACESSIBILIDADE_SINAL_SONORO] [varchar](500) NULL,
	[IN_ACESSIBILIDADE_SINAL_TATIL] [varchar](500) NULL,
	[IN_ACESSIBILIDADE_SINAL_VISUAL] [varchar](500) NULL,
	[IN_ACESSIBILIDADE_INEXISTENTE] [varchar](500) NULL,
	[IN_ACESSIBILIDADE_SINALIZACAO] [varchar](500) NULL,
	[QT_SALAS_UTILIZADAS_DENTRO] [varchar](500) NULL,
	[QT_SALAS_UTILIZADAS_FORA] [varchar](500) NULL,
	[QT_SALAS_UTILIZADAS] [varchar](500) NULL,
	[QT_SALAS_UTILIZA_CLIMATIZADAS] [varchar](500) NULL,
	[QT_SALAS_UTILIZADAS_ACESSIVEIS] [varchar](500) NULL,
	[QT_SALAS_LEITURA] [varchar](500) NULL,
	[IN_EQUIP_PARABOLICA] [varchar](500) NULL,
	[IN_COMPUTADOR] [varchar](500) NULL,
	[IN_EQUIP_COPIADORA] [varchar](500) NULL,
	[IN_EQUIP_IMPRESSORA] [varchar](500) NULL,
	[IN_EQUIP_IMPRESSORA_MULT] [varchar](500) NULL,
	[IN_EQUIP_SCANNER] [varchar](500) NULL,
	[IN_EQUIP_NENHUM] [varchar](500) NULL,
	[IN_EQUIP_DVD] [varchar](500) NULL,
	[QT_EQUIP_DVD] [varchar](500) NULL,
	[IN_EQUIP_SOM] [varchar](500) NULL,
	[QT_EQUIP_SOM] [varchar](500) NULL,
	[IN_EQUIP_TV] [varchar](500) NULL,
	[QT_EQUIP_TV] [varchar](500) NULL,
	[IN_EQUIP_LOUSA_DIGITAL] [varchar](500) NULL,
	[QT_EQUIP_LOUSA_DIGITAL] [varchar](500) NULL,
	[IN_EQUIP_MULTIMIDIA] [varchar](500) NULL,
	[QT_EQUIP_MULTIMIDIA] [varchar](500) NULL,
	[IN_DESKTOP_ALUNO] [varchar](500) NULL,
	[QT_DESKTOP_ALUNO] [varchar](500) NULL,
	[IN_COMP_PORTATIL_ALUNO] [varchar](500) NULL,
	[QT_COMP_PORTATIL_ALUNO] [varchar](500) NULL,
	[IN_TABLET_ALUNO] [varchar](500) NULL,
	[QT_TABLET_ALUNO] [varchar](500) NULL,
	[IN_INTERNET] [varchar](500) NULL,
	[IN_INTERNET_ALUNOS] [varchar](500) NULL,
	[IN_INTERNET_ADMINISTRATIVO] [varchar](500) NULL,
	[IN_INTERNET_APRENDIZAGEM] [varchar](500) NULL,
	[IN_INTERNET_COMUNIDADE] [varchar](500) NULL,
	[IN_ACESSO_INTERNET_COMPUTADOR] [varchar](500) NULL,
	[IN_ACES_INTERNET_DISP_PESSOAIS] [varchar](500) NULL,
	[TP_REDE_LOCAL] [varchar](500) NULL,
	[IN_BANDA_LARGA] [varchar](500) NULL,
	[QT_PROF_ADMINISTRATIVOS] [varchar](500) NULL,
	[QT_PROF_SERVICOS_GERAIS] [varchar](500) NULL,
	[QT_PROF_BIBLIOTECARIO] [varchar](500) NULL,
	[QT_PROF_SAUDE] [varchar](500) NULL,
	[QT_PROF_COORDENADOR] [varchar](500) NULL,
	[QT_PROF_FONAUDIOLOGO] [varchar](500) NULL,
	[QT_PROF_NUTRICIONISTA] [varchar](500) NULL,
	[QT_PROF_PSICOLOGO] [varchar](500) NULL,
	[QT_PROF_ALIMENTACAO] [varchar](500) NULL,
	[QT_PROF_PEDAGOGIA] [varchar](500) NULL,
	[QT_PROF_SECRETARIO] [varchar](500) NULL,
	[QT_PROF_SEGURANCA] [varchar](500) NULL,
	[QT_PROF_MONITORES] [varchar](500) NULL,
	[QT_PROF_GESTAO] [varchar](500) NULL,
	[QT_PROF_ASSIST_SOCIAL] [varchar](500) NULL,
	[QT_PROF_TRAD_LIBRAS] [varchar](500) NULL,
	[QT_PROF_AGRICOLA] [varchar](500) NULL,
	[QT_PROF_REVISOR_BRAILLE] [varchar](500) NULL,
	[IN_ALIMENTACAO] [varchar](500) NULL,
	[IN_MATERIAL_PED_MULTIMIDIA] [varchar](500) NULL,
	[IN_MATERIAL_PED_INFANTIL] [varchar](500) NULL,
	[IN_MATERIAL_PED_CIENTIFICO] [varchar](500) NULL,
	[IN_MATERIAL_PED_DIFUSAO] [varchar](500) NULL,
	[IN_MATERIAL_PED_MUSICAL] [varchar](500) NULL,
	[IN_MATERIAL_PED_JOGOS] [varchar](500) NULL,
	[IN_MATERIAL_PED_ARTISTICAS] [varchar](500) NULL,
	[IN_MATERIAL_PED_PROFISSIONAL] [varchar](500) NULL,
	[IN_MATERIAL_PED_DESPORTIVA] [varchar](500) NULL,
	[IN_MATERIAL_PED_INDIGENA] [varchar](500) NULL,
	[IN_MATERIAL_PED_ETNICO] [varchar](500) NULL,
	[IN_MATERIAL_PED_CAMPO] [varchar](500) NULL,
	[IN_MATERIAL_PED_BIL_SURDOS] [varchar](500) NULL,
	[IN_MATERIAL_PED_AGRICOLA] [varchar](500) NULL,
	[IN_MATERIAL_PED_QUILOMBOLA] [varchar](500) NULL,
	[IN_MATERIAL_PED_EDU_ESP] [varchar](500) NULL,
	[IN_MATERIAL_PED_NENHUM] [varchar](500) NULL,
	[IN_EDUCACAO_INDIGENA] [varchar](500) NULL,
	[TP_INDIGENA_LINGUA] [varchar](500) NULL,
	[CO_LINGUA_INDIGENA_1] [varchar](500) NULL,
	[CO_LINGUA_INDIGENA_2] [varchar](500) NULL,
	[CO_LINGUA_INDIGENA_3] [varchar](500) NULL,
	[IN_EXAME_SELECAO] [varchar](500) NULL,
	[IN_RESERVA_PPI] [varchar](500) NULL,
	[IN_RESERVA_RENDA] [varchar](500) NULL,
	[IN_RESERVA_PUBLICA] [varchar](500) NULL,
	[IN_RESERVA_PCD] [varchar](500) NULL,
	[IN_RESERVA_OUTROS] [varchar](500) NULL,
	[IN_RESERVA_NENHUMA] [varchar](500) NULL,
	[IN_REDES_SOCIAIS] [varchar](500) NULL,
	[IN_ESPACO_ATIVIDADE] [varchar](500) NULL,
	[IN_ESPACO_EQUIPAMENTO] [varchar](500) NULL,
	[IN_ORGAO_ASS_PAIS] [varchar](500) NULL,
	[IN_ORGAO_ASS_PAIS_MESTRES] [varchar](500) NULL,
	[IN_ORGAO_CONSELHO_ESCOLAR] [varchar](500) NULL,
	[IN_ORGAO_GREMIO_ESTUDANTIL] [varchar](500) NULL,
	[IN_ORGAO_OUTROS] [varchar](500) NULL,
	[IN_ORGAO_NENHUM] [varchar](500) NULL,
	[TP_PROPOSTA_PEDAGOGICA] [varchar](500) NULL,
	[IN_EDUC_AMBIENTAL] [varchar](500) NULL,
	[IN_EDUC_AMB_CONTEUDO] [varchar](500) NULL,
	[IN_EDUC_AMB_CURRICULAR] [varchar](500) NULL,
	[IN_EDUC_AMB_EIXO] [varchar](500) NULL,
	[IN_EDUC_AMB_EVENTOS] [varchar](500) NULL,
	[IN_EDUC_AMB_PROJETOS] [varchar](500) NULL,
	[IN_EDUC_AMB_NENHUMA] [varchar](500) NULL,
	[TP_AEE] [varchar](500) NULL,
	[TP_ATIVIDADE_COMPLEMENTAR] [varchar](500) NULL,
	[TP_ITINERARIO_FORMATIVO] [varchar](500) NULL,
	[IN_ITINERARIO_APROFUNDAMENTO] [varchar](500) NULL,
	[IN_ITINERARIO_TECN_PROF] [varchar](500) NULL,
	[IN_ESCOLARIZACAO] [varchar](500) NULL,
	[IN_MEDIACAO_PRESENCIAL] [varchar](500) NULL,
	[IN_MEDIACAO_SEMIPRESENCIAL] [varchar](500) NULL,
	[IN_MEDIACAO_EAD] [varchar](500) NULL,
	[IN_ESPECIAL_EXCLUSIVA] [varchar](500) NULL,
	[IN_REGULAR] [varchar](500) NULL,
	[IN_EJA] [varchar](500) NULL,
	[IN_PROFISSIONALIZANTE] [varchar](500) NULL,
	[IN_COMUM_CRECHE] [varchar](500) NULL,
	[IN_COMUM_PRE] [varchar](500) NULL,
	[IN_COMUM_FUND_AI] [varchar](500) NULL,
	[IN_COMUM_FUND_AF] [varchar](500) NULL,
	[IN_COMUM_MEDIO_MEDIO] [varchar](500) NULL,
	[IN_COMUM_MEDIO_INTEGRADO] [varchar](500) NULL,
	[IN_COMUM_MEDIO_FIC] [varchar](500) NULL,
	[IN_COMUM_MEDIO_NORMAL] [varchar](500) NULL,
	[IN_ESP_EXCLUSIVA_CRECHE] [varchar](500) NULL,
	[IN_ESP_EXCLUSIVA_PRE] [varchar](500) NULL,
	[IN_ESP_EXCLUSIVA_FUND_AI] [varchar](500) NULL,
	[IN_ESP_EXCLUSIVA_FUND_AF] [varchar](500) NULL,
	[IN_ESP_EXCLUSIVA_MEDIO_MEDIO] [varchar](500) NULL,
	[IN_ESP_EXCLUSIVA_MEDIO_INTEGR] [varchar](500) NULL,
	[IN_ESP_EXCLUSIVA_MEDIO_FIC] [varchar](500) NULL,
	[IN_ESP_EXCLUSIVA_MEDIO_NORMAL] [varchar](500) NULL,
	[IN_COMUM_EJA_FUND] [varchar](500) NULL,
	[IN_COMUM_EJA_MEDIO] [varchar](500) NULL,
	[IN_COMUM_EJA_PROF] [varchar](500) NULL,
	[IN_ESP_EXCLUSIVA_EJA_FUND] [varchar](500) NULL,
	[IN_ESP_EXCLUSIVA_EJA_MEDIO] [varchar](500) NULL,
	[IN_ESP_EXCLUSIVA_EJA_PROF] [varchar](500) NULL,
	[IN_COMUM_PROF] [varchar](500) NULL,
	[IN_ESP_EXCLUSIVA_PROF] [varchar](500) NULL
) ON [PRIMARY]
GO
