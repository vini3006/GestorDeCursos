import { Request, Response } from "express";
import reportService from "../services/report-service";

const reportController = {
    getAllStudents: async (req: Request, res: Response) => {
        try {
            const result = await reportService.getAllStudents();
            return res.status(200).json(result);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ msg: "Erro ao listar alunos!" });
        }
    },

    getAllProfessors: async (req: Request, res: Response) => {
        try {
            const result = await reportService.getAllProfessors();
            return res.status(200).json(result);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ msg: "Erro ao listar professores!" });
        }
    },

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

    avgGradesPerSemesterFromSubject: async(req: Request, res: Response) => {
        const { idMateria } = req.params;

        if(!idMateria){
            res.status(400).json({msg: "Matéria não informada!"});
        }
        
        try{
            const result = await reportService.avgGradesPerSemesterFromSubject(Number(idMateria));
            return res.status(200).json(result);
        } catch(err){
            console.error(err);
            return res.status(500).json({msg: "Erro ao coletar dados!"});
        }
    },

    studentsBelowFive: async(req: Request, res: Response) => {
        try{
            const result = await reportService.studentsBelowFive();
            return res.status(200).json(result);
        }catch(err){
            console.error(err);
            return res.status(500).json({msg: "Erro ao coletar dados!"});
        }
    },

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

    mostActiveClassesProfessor: async(req: Request, res: Response) => {
        try{
            const result = await reportService.mostActiveClassesProfessor();
            return res.status(200).json(result);
        }catch(err){
            console.error(err);
            return res.status(500).json({msg: "Erro ao coletar dados!"});
        }
    },

    betterRatedClasses: async (req: Request, res: Response) => {
        try {
            const result = await reportService.betterRatedClasses();
            return res.status(200).json(result);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ msg: "Erro ao coletar dados do ranking!" });
        }
    },

    studentProfessors: async (req: Request, res: Response) => {
        try {
            const result = await reportService.studentProfessors();
            return res.status(200).json(result);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ msg: "Erro ao coletar usuarios!" });
        }
    },

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