create database gestorDeCursos;
use gestorDeCursos; 

create table usuario (
	cpf char(11) primary key,
    nome varchar(100),
    dt_nascimento date NOT NULL,
    email varchar(50)
);

create table conta (
	matricula varchar(50) primary key,
    senha varchar(50) NOT NULL,
    tipo enum ('administrador', 'professor', 'aluno') NOT NULL,
    dataCriacao date NOT NULL,
    cpf char(11) NOT NULL, 
    foreign key (cpf) references usuario (cpf)
);

create table materia (
	id int auto_increment primary key,
    nome varchar(50) NOT NULL,
    periodo int NOT NULL
);

create table periodoLetivo (
	id int auto_increment primary key,
	nome varchar(50) NOT NULL,
    dataInicio date NOT NULL, 
    dataFim date NOT NULL
);

create table turma (
	id int auto_increment primary key,
	idMateria int NOT NULL,
    cpfProfessor char(11),
    numAlunos int,
    maxAlunos int NOT NULL,
    idPeriodoLetivo int NOT NULL,
    foreign key (idMateria) references materia (id),
    foreign key (cpfProfessor) references usuario (cpf),
    foreign key (idPeriodoLetivo) references periodoLetivo (id)
);

create table aluno_turma (
	cpfAluno char(11),
    idTurma int, 
    notaP1 decimal(5,2),
    notaP2 decimal(5,2),
    notaPF decimal(5,2),
    mediaFinal decimal(5,2), 
    primary key(cpfAluno, idTurma),
    foreign key (cpfAluno) references usuario (cpf),
    foreign key (idTurma) references turma (id) on delete cascade	
);

create table historico_alunos (
	cpfAluno char(11),
    idMateria int, 
    idPeriodoLetivo int, 
    notaFinal decimal(5,2),
    situacao enum('aprovado', 'pf', 'reprovado'),
    dataConclusao date NOT NULL,
    primary key(cpfAluno, idMateria, idPeriodoLetivo),
	foreign key (cpfAluno) references usuario(cpf),
    foreign key (idMateria) references materia(id),
    foreign key (idPeriodoLetivo) references periodoLetivo(id)
);

create table atividade_avaliativa (
	id int auto_increment primary key,
    idTurma int NOT NULL,
    titulo varchar(50),
    descricao text,
    dataAbertura datetime NOT NULL,
    dataFechamento datetime NOT NULL,
    notaMaxima decimal(5,2),
    foreign key (idTurma) references turma (id) on delete cascade
);

create table entrega_atividade (
	idAtividade int,
    cpfAluno char(11),
    arquivo varchar(255),
    dataEntrega	datetime, 
    nota decimal(5,2),
    primary key (idAtividade, cpfAluno),
    foreign key (idAtividade) references atividade_avaliativa (id) on delete cascade,
    foreign key (cpfAluno) references usuario (cpf)
);

create table material (
	id int auto_increment primary key,
    idTurma int NOT NULL, 
    titulo varchar(50),
    descricao text,
    link varchar(255),
    dataPostagem datetime default current_timestamp,
    foreign key (idTurma) references turma (id) on delete cascade
);









