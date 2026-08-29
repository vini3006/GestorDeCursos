-- MySQL dump 10.13  Distrib 9.5.0, for Linux (x86_64)
--
-- Host: localhost    Database: gestorDeCursos
-- ------------------------------------------------------
-- Server version	9.5.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '4654ba6e-d6d5-11f0-a831-e237649b648e:1-23';

--
-- Table structure for table `atividade_avaliativa`
--

DROP TABLE IF EXISTS `atividade_avaliativa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `atividade_avaliativa` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idTurma` int NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `descricao` text NOT NULL,
  `dataFechamento` datetime NOT NULL,
  `notaMaxima` decimal(7,2) NOT NULL DEFAULT '10.00',
  `dataCriacao` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_ativ_turma` (`idTurma`),
  CONSTRAINT `fk_ativ_turma` FOREIGN KEY (`idTurma`) REFERENCES `turma` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `atividade_avaliativa`
--

LOCK TABLES `atividade_avaliativa` WRITE;
/*!40000 ALTER TABLE `atividade_avaliativa` DISABLE KEYS */;
/*!40000 ALTER TABLE `atividade_avaliativa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conta`
--

DROP TABLE IF EXISTS `conta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conta` (
  `matricula` varchar(40) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `tipo` enum('administrador','professor','aluno') NOT NULL,
  `cpf` varchar(14) NOT NULL,
  `dataCriacao` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`matricula`),
  KEY `fk_conta_usuario` (`cpf`),
  CONSTRAINT `fk_conta_usuario` FOREIGN KEY (`cpf`) REFERENCES `usuario` (`cpf`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conta`
--

LOCK TABLES `conta` WRITE;
/*!40000 ALTER TABLE `conta` DISABLE KEYS */;
INSERT INTO `conta` VALUES ('ADMIN001','trocar-esta-senha','administrador','00000000000','2025-01-01 00:00:00');
/*!40000 ALTER TABLE `conta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `curso`
--

DROP TABLE IF EXISTS `curso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `curso` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(200) NOT NULL,
  `maxAlunos` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `curso`
--

LOCK TABLES `curso` WRITE;
/*!40000 ALTER TABLE `curso` DISABLE KEYS */;
/*!40000 ALTER TABLE `curso` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `entrega_atividade`
--

DROP TABLE IF EXISTS `entrega_atividade`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `entrega_atividade` (
  `idAtividade` int NOT NULL,
  `cpfAluno` varchar(14) NOT NULL,
  `arquivo` text NOT NULL,
  `dataEntrega` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `nota` decimal(5,2) DEFAULT NULL,
  PRIMARY KEY (`idAtividade`,`cpfAluno`,`dataEntrega`),
  KEY `fk_entrega_aluno` (`cpfAluno`),
  CONSTRAINT `fk_entrega_aluno` FOREIGN KEY (`cpfAluno`) REFERENCES `usuario` (`cpf`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_entrega_atividade` FOREIGN KEY (`idAtividade`) REFERENCES `atividade_avaliativa` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `entrega_atividade`
--

LOCK TABLES `entrega_atividade` WRITE;
/*!40000 ALTER TABLE `entrega_atividade` DISABLE KEYS */;
/*!40000 ALTER TABLE `entrega_atividade` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `filaEspera`
--

DROP TABLE IF EXISTS `filaEspera`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `filaEspera` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cpfAluno` varchar(14) NOT NULL,
  `idTurma` int NOT NULL,
  `prioridade` int NOT NULL,
  `dataEntrada` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_fila` (`cpfAluno`,`idTurma`),
  KEY `fk_fila_turma` (`idTurma`),
  CONSTRAINT `fk_fila_aluno` FOREIGN KEY (`cpfAluno`) REFERENCES `usuario` (`cpf`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_fila_turma` FOREIGN KEY (`idTurma`) REFERENCES `turma` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `filaEspera`
--

LOCK TABLES `filaEspera` WRITE;
/*!40000 ALTER TABLE `filaEspera` DISABLE KEYS */;
/*!40000 ALTER TABLE `filaEspera` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historico_alunos`
--

DROP TABLE IF EXISTS `historico_alunos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historico_alunos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idMateria` int DEFAULT NULL,
  `idPeriodoLetivo` int DEFAULT NULL,
  `cpfAluno` varchar(14) NOT NULL,
  `notaFinal` decimal(5,2) DEFAULT NULL,
  `situacao` varchar(50) DEFAULT NULL,
  `dataConclusao` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_hist_materia` (`idMateria`),
  KEY `fk_hist_periodo` (`idPeriodoLetivo`),
  KEY `fk_hist_aluno` (`cpfAluno`),
  CONSTRAINT `fk_hist_aluno` FOREIGN KEY (`cpfAluno`) REFERENCES `usuario` (`cpf`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_hist_materia` FOREIGN KEY (`idMateria`) REFERENCES `materia` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_hist_periodo` FOREIGN KEY (`idPeriodoLetivo`) REFERENCES `periodoLetivo` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historico_alunos`
--

LOCK TABLES `historico_alunos` WRITE;
/*!40000 ALTER TABLE `historico_alunos` DISABLE KEYS */;
/*!40000 ALTER TABLE `historico_alunos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `materia`
--

DROP TABLE IF EXISTS `materia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `materia` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(200) NOT NULL,
  `idCurso` int DEFAULT NULL,
  `periodo` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_materia_curso` (`idCurso`),
  CONSTRAINT `fk_materia_curso` FOREIGN KEY (`idCurso`) REFERENCES `curso` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `materia`
--

LOCK TABLES `materia` WRITE;
/*!40000 ALTER TABLE `materia` DISABLE KEYS */;
/*!40000 ALTER TABLE `materia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `material`
--

DROP TABLE IF EXISTS `material`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `material` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idTurma` int NOT NULL,
  `titulo` varchar(250) NOT NULL,
  `descricao` text,
  `link` varchar(1000) NOT NULL,
  `dataPostagem` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_material_turma` (`idTurma`),
  CONSTRAINT `fk_material_turma` FOREIGN KEY (`idTurma`) REFERENCES `turma` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `material`
--

LOCK TABLES `material` WRITE;
/*!40000 ALTER TABLE `material` DISABLE KEYS */;
/*!40000 ALTER TABLE `material` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `matriculas`
--

DROP TABLE IF EXISTS `matriculas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `matriculas` (
  `cpfAluno` varchar(14) NOT NULL,
  `idTurma` int NOT NULL,
  `notaP1` decimal(5,2) DEFAULT NULL,
  `notaP2` decimal(5,2) DEFAULT NULL,
  `notaPF` decimal(5,2) DEFAULT NULL,
  `mediaFinal` decimal(5,2) DEFAULT NULL,
  `dataMatricula` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`cpfAluno`,`idTurma`),
  KEY `fk_mat_turma` (`idTurma`),
  CONSTRAINT `fk_mat_aluno` FOREIGN KEY (`cpfAluno`) REFERENCES `usuario` (`cpf`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_mat_turma` FOREIGN KEY (`idTurma`) REFERENCES `turma` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `matriculas`
--

LOCK TABLES `matriculas` WRITE;
/*!40000 ALTER TABLE `matriculas` DISABLE KEYS */;
/*!40000 ALTER TABLE `matriculas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notificacoes`
--

DROP TABLE IF EXISTS `notificacoes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notificacoes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cpfProfessor` varchar(14) NOT NULL,
  `idTurma` int NOT NULL,
  `mensagem` text NOT NULL,
  `lida` tinyint(1) NOT NULL DEFAULT '0',
  `dataCriacao` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_notif_prof` (`cpfProfessor`),
  KEY `fk_notif_turma` (`idTurma`),
  CONSTRAINT `fk_notif_prof` FOREIGN KEY (`cpfProfessor`) REFERENCES `usuario` (`cpf`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_notif_turma` FOREIGN KEY (`idTurma`) REFERENCES `turma` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notificacoes`
--

LOCK TABLES `notificacoes` WRITE;
/*!40000 ALTER TABLE `notificacoes` DISABLE KEYS */;
/*!40000 ALTER TABLE `notificacoes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `periodoLetivo`
--

DROP TABLE IF EXISTS `periodoLetivo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `periodoLetivo` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(150) NOT NULL,
  `dataInicio` date NOT NULL,
  `dataFim` date NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `periodoLetivo`
--

LOCK TABLES `periodoLetivo` WRITE;
/*!40000 ALTER TABLE `periodoLetivo` DISABLE KEYS */;
/*!40000 ALTER TABLE `periodoLetivo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `turma`
--

DROP TABLE IF EXISTS `turma`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `turma` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idMateria` int NOT NULL,
  `cpfProfessor` varchar(14) NOT NULL,
  `maxAlunos` int NOT NULL,
  `numAlunos` int NOT NULL DEFAULT '0',
  `idPeriodoLetivo` int NOT NULL,
  `dataFechamentoFila` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_turma_materia` (`idMateria`),
  KEY `fk_turma_professor` (`cpfProfessor`),
  KEY `fk_turma_periodo` (`idPeriodoLetivo`),
  CONSTRAINT `fk_turma_materia` FOREIGN KEY (`idMateria`) REFERENCES `materia` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_turma_periodo` FOREIGN KEY (`idPeriodoLetivo`) REFERENCES `periodoLetivo` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_turma_professor` FOREIGN KEY (`cpfProfessor`) REFERENCES `usuario` (`cpf`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `turma`
--

LOCK TABLES `turma` WRITE;
/*!40000 ALTER TABLE `turma` DISABLE KEYS */;
/*!40000 ALTER TABLE `turma` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`%`*/ /*!50003 TRIGGER `trg_turma_para_historico` AFTER DELETE ON `turma` FOR EACH ROW BEGIN
    INSERT INTO historico_alunos (
        idMateria, 
        idPeriodoLetivo, 
        cpfAluno, 
        notaFinal, 
        situacao, 
        dataConclusao
    )
    SELECT  
        OLD.idMateria,
        OLD.idPeriodoLetivo,
        m.cpfAluno,
        m.mediaFinal,
        CASE
            WHEN m.notaPF IS NULL THEN 'aprovado'
            
            WHEN m.mediaFinal >= 5.0 THEN 'pf'
            
            ELSE 'reprovado'
        END AS situacao, 
        NOW()
    FROM matriculas m
    WHERE m.idTurma = OLD.id;

END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `cpf` varchar(14) NOT NULL,
  `nome` varchar(150) NOT NULL,
  `dt_nascimento` date DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`cpf`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES ('00000000000','Administrador do Sistema','2000-01-01','admin@example.com');
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-11 22:17:52
