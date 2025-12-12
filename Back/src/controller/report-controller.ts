import { Request, Response } from "express"; // Gerenciamento das requisições
import reportService from "../services/report-service"; // Service para funções de relatório.

const reportController = {
    /**
     * Retorna a lista de todos os usuários com conta do tipo 'aluno'.
     * Rota exclusiva para Administradores.
     */
    getAllStudents: async (req: Request, res: Response) => {
        try {
            const result = await reportService.getAllStudents();
            return res.status(200).json(result);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ msg: "Erro ao listar alunos!" });
        }
    },

    /**
     * Retorna a lista de todos os usuários com conta do tipo 'professor'.
     * Rota exclusiva para Administradores.
     */
    getAllProfessors: async (req: Request, res: Response) => {
        try {
            const result = await reportService.getAllProfessors();
            return res.status(200).json(result);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ msg: "Erro ao listar professores!" });
        }
    },

    /**
     * Calcula o número de alunos por turma para uma matéria específica (idMateria).
     * Rota exclusiva para Administradores.
     */
    numStudentsPerClassFromSubject: async(req: Request, res: Response) => {
        const { idMateria } = req.params;

        if(!idMateria){
            res.status(400).json({msg: "Matéria não informada!"});
        }

        try{
            const result = await reportService.numStudentsPerClassFromSubject(Number(idMateria));
            return res.status(200).json(result);
        } catch(err){
            console.error(err);
            return res.status(500).json({msg: "Erro ao coletar dados!"});
        }
    },

    /**
     * Calcula a média das notas por período para uma matéria específica (idMateria).
     * Rota exclusiva para Administradores.
     */
    avgGradesPerSemesterFromSubject: async(req: Request, res: Response) => {
        const { idMateria } = req.params;

        if(!idMateria){
            return res.status(400).json({msg: "Matéria não informada!"})
        }
        try{
            const result = await reportService.avgGradesPerSemesterFromSubject(Number(idMateria));
            return res.status(200).json(result);
        } catch(err){
            console.error(err);
            return res.status(500).json({msg: "Erro ao coletar dados!"});
        }
    },

    /**
     * Lista todos os alunos que reprovaram em alguma matéria (nota final < 5.0).
     * Rota exclusiva para Administradores.
     */
    studentsBelowFive: async(req: Request, res: Response) => {
        try{
            const result = await reportService.studentsBelowFive();
            return res.status(200).json(result);
        }catch(err){
            console.error(err);
            return res.status(500).json({msg: "Erro ao coletar dados!"});
        }
    },

    /**
     * Lista as turmas ativas de um professor específico (cpfProfessor).
     * Rota exclusiva para Administradores.
     */
    activeClassesFromProfessor: async(req: Request, res: Response) => {
        const { cpfProfessor } = req.params;

        if(!cpfProfessor){
            res.status(400).json({msg: "Professor não informado!"});
        }

        try{
            const result = await reportService.activeClassesFromProfessor(cpfProfessor);
            return res.status(200).json(result);
        }catch(err){
            console.error(err);
            return res.status(500).json({msg: "Erro ao coletar dados!"});
        }
    },

    /**
     * Identifica o professor com o maior número de turmas associadas.
     * Rota exclusiva para Administradores.
     */
    mostActiveClassesProfessor: async(req: Request, res: Response) => {
        try{
            const result = await reportService.mostActiveClassesProfessor();
            return res.status(200).json(result);
        }catch(err){
            console.error(err);
            return res.status(500).json({msg: "Erro ao coletar dados!"});
        }
    },

    /**
     * Lista as 3 matérias/períodos com as melhores médias finais.
     * Rota exclusiva para Administradores.
     */
    betterRatedClasses: async (req: Request, res: Response) => {
        try {
            const result = await reportService.betterRatedClasses();
            return res.status(200).json(result);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ msg: "Erro ao coletar dados do ranking!" });
        }
    },

    /**
     * Identifica usuários que possuem contas de 'aluno' e 'professor' simultaneamente.
     * Rota exclusiva para Administradores.
     */
    studentProfessors: async (req: Request, res: Response) => {
        try {
            const result = await reportService.studentProfessors();
            return res.status(200).json(result);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ msg: "Erro ao coletar usuarios!" });
        }
    },

    /**
     * Identifica o aluno que concluiu o maior número de matérias.
     * Rota exclusiva para Administradores.
     */
    mostSubjectsDone: async (req: Request, res: Response) => {
        try {
            const result = await reportService.mostSubjectsDone();
            return res.status(200).json(result);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ msg: "Erro ao coletar dados do aluno mais ativo!" });
        }
    }
}

export default reportController;