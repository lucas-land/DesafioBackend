-- MySQL dump 10.13  Distrib 26.10.0, for Win64 (x86_64)
--
-- Host: localhost    Database: desafio_backend
-- ------------------------------------------------------
-- Server version	26.10.0

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

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '6d4c6b05-e029-11f1-aa4a-c87f54d10f9f:1-47';

--
-- Table structure for table `disciplinas`
--

DROP TABLE IF EXISTS `disciplinas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `disciplinas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nome` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cargaHoraria` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_disciplinas_codigo` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `disciplinas`
--

LOCK TABLES `disciplinas` WRITE;
/*!40000 ALTER TABLE `disciplinas` DISABLE KEYS */;
INSERT INTO `disciplinas` VALUES (4,'061281','Programação I',80),(5,'061282','Laboratório I',60),(6,'010548','Tecnocultura',40),(7,'060666','Arquitetura da Informação',60),(8,'061283','Processo de Software',60),(9,'050858','Empreendedorismo e Solução de Problemas',40),(10,'060665','Sistemas para Internet',80),(11,'060667','Comunicação Gráfica para Internet',60),(12,'061284','Fundamentos de Banco de Dados',80),(13,'061297','Engenharia de Software: Requisitos',60),(14,'061298','Programação II',80),(15,'061299','Laboratório II',60),(16,'050860','Estatística Aplicada',60),(17,'060462','Processos de Teste de Software',60),(18,'060669','Programação Front-end',80),(19,'060672','Programação para Dispositivos Móveis',80);
/*!40000 ALTER TABLE `disciplinas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `matriculas`
--

DROP TABLE IF EXISTS `matriculas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `matriculas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `alunoId` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `turmaId` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_matriculas_aluno_turma` (`alunoId`,`turmaId`),
  KEY `fk_matriculas_turma` (`turmaId`),
  CONSTRAINT `fk_matriculas_aluno` FOREIGN KEY (`alunoId`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_matriculas_turma` FOREIGN KEY (`turmaId`) REFERENCES `turmas` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `matriculas`
--

LOCK TABLES `matriculas` WRITE;
/*!40000 ALTER TABLE `matriculas` DISABLE KEYS */;
INSERT INTO `matriculas` VALUES (3,'cc998e28-08d9-4208-a47a-24198ee466e7',3);
/*!40000 ALTER TABLE `matriculas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `professors`
--

DROP TABLE IF EXISTS `professors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `professors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `professors`
--

LOCK TABLES `professors` WRITE;
/*!40000 ALTER TABLE `professors` DISABLE KEYS */;
INSERT INTO `professors` VALUES (1,'Prof. Carlos Mendes'),(2,'Profa. Ana Paula Silva'),(3,'Prof. Roberto Oliveira'),(4,'Profa. Fernanda Costa'),(5,'Prof. Eduardo Santos'),(6,'Profa. Mariana Lima'),(7,'Prof. André Souza'),(8,'Profa. Juliana Alves');
/*!40000 ALTER TABLE `professors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `turmas`
--

DROP TABLE IF EXISTS `turmas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `turmas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `disciplinaId` int NOT NULL,
  `professorId` int NOT NULL,
  `diaSemana` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `turno` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `limiteVagas` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_turmas_disciplina` (`disciplinaId`),
  KEY `fk_turmas_professor` (`professorId`),
  CONSTRAINT `fk_turmas_disciplina` FOREIGN KEY (`disciplinaId`) REFERENCES `disciplinas` (`id`),
  CONSTRAINT `fk_turmas_professor` FOREIGN KEY (`professorId`) REFERENCES `professors` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `turmas`
--

LOCK TABLES `turmas` WRITE;
/*!40000 ALTER TABLE `turmas` DISABLE KEYS */;
INSERT INTO `turmas` VALUES (3,4,1,'Segunda-feira','Manhã',35),(4,12,2,'Terça-feira','Tarde',30),(5,18,3,'Quarta-feira','Noite',40),(6,10,4,'Quinta-feira','Manhã',30),(7,14,5,'Sexta-feira','Tarde',35);
/*!40000 ALTER TABLE `turmas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `perfil` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('7413fd09-1179-470b-a68d-f2472c5e05e4','admin','0319b3857099c13f9109be5e1ad0c3c9:9bafe953795e14a913816a52544a5630edf7211ed002c1b6f54c5e7fdc8c46e177ef106342e6f1345d363d047207f8fe4d0fcb9d6cbc0ac0506a80d5e48bc7da','admin'),('cc998e28-08d9-4208-a47a-24198ee466e7','aluno','d5e08d0e0aee9b649c1a2399df37dde7:d46bb5d202fc52ef0166eb513e45fd56bf9840044d0e0d03efe7a860a06ed539fd4a079c971bf0863788e5b7f5ddc014348e47d01952923b9358e008ad7b862e','aluno');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
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

-- Dump completed on 2026-11-14 14:24:23
