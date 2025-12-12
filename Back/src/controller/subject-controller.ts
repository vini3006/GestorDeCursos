import { Request, Response } from "express"; // Gerenciamento das requisições
import subjectService from "../services/subject-service"; // Service para operações de Disciplina.
import { Subject } from "../models/subject-model"; // Modelo de Disciplina.
import courseService from "../services/course-service"; // Service para verificar a existência do Curso.

const subjectController = {
    /**
     * Lista todas as disciplinas cadastradas no sistema.
     */
    getAll: async(req: Request, res:Response) => {
        try {
            const subjects: Subject[] = await subjectService.getAll();
            return res.status(200).json(subjects);
        } catch (err){
            console.error(err);
            return res.status(500).json({msg: "Erro ao buscar disciplinas!"});
        }
    },

    /**
     * Cria uma nova disciplina, verificando antes se o curso associado (idCurso) existe.
     * Rota exclusiva para Administradores.
     */
    createSubject: async(req: Request, res: Response) => {
        const { nome, periodo, idCurso } = req.body;

        if(!nome || !periodo || !idCurso){
            return res.status(400).json({msg: "Nome ,período e curso ao qual está associada são obrigatórios!"});
        }

        try {
            // Verifica a existência do curso.
            const course = await courseService.getCourseById(idCurso);

            if(!course){
                return res.status(404).json({msg: "Curso não encontrado!"});
            }
            
            const newSubject: Subject = await subjectService.createSubject(nome, periodo, idCurso);
            return res.status(201).json({newSubject, msg: "Disciplina inserida com sucesso!"});
        } catch (err){
            console.error(err);
            return res.status(500).json({msg: "Erro ao inserir disciplina!"});
        }
    },

    /**
     * Atualiza o nome e/ou o período de uma disciplina específica (ID).
     * Rota exclusiva para Administradores.
     */
    updateSubject: async(req: Request, res: Response) => {
        const { id } = req.params;
        const { nome, periodo } = req.body;

        if (!nome && !periodo){
            return res.status(400).json({msg: "Nada para atualizar!"});
        }

        try {
            const updatedSubject: Subject | null = await subjectService.updateSubject(Number(id), nome, periodo);

            if(!updatedSubject){
                return res.status(404).json({msg: "Disciplina não encontrada!"});
            }

            return res.status(200).json({ updatedSubject, msg: "Dados da disciplina atualizados com sucesso!"});
        }catch (err){
            console.error(err);
            return res.status(500).json({msg: "Erro ao atualizar disciplina!"});
        }
    },

    /**
     * Deleta uma disciplina específica (ID).
     * Rota exclusiva para Administradores.
     */
    deleteSubject: async (req: Request, res: Response) => {
        const { id } = req.params;

        if (!id){
            return res.status(400).json({msg: "ID da disciplina a ser removida não informado!"});
        }

        try{
            const subjectDeleted = await subjectService.deleteSubject(Number(id));

           if (!subjectDeleted){
               return res.status(404).json({ msg: "Disciplina não encontrada!" });
           }

            return res.status(200).json({ result: subjectDeleted, msg: "Disciplina removida com sucesso!" });
        } catch (err){
            console.error(err);
            return res.status(500).json({msg: "Erro ao deletar disciplina!"});
        }
    }
} 

export default subjectController;