import { Request, Response } from "express"; // Gerenciamento das requisições
import courseService from "../services/course-service"; // Service para operações de Curso.
import { Course } from "../models/course-model"; // Modelo de Curso.

const courseController = {
    /**
     * Lista todos os cursos cadastrados no sistema.
     */
    getAll: async(req: Request, res: Response) => {
        try{
            const courses = await courseService.getAll();
            return res.status(200).json(courses);
        } catch (err){
            console.error(err);
            return res.status(500).json({ msg: "Erro ao buscar cursos!" });
        }
    },

    /**
     * Cria um novo curso.
     * Rota exclusiva para Administradores.
     */
    createCourse: async (req: Request, res: Response) => {
        const { nome, maxAlunos } = req.body;

        if (!nome || maxAlunos === undefined) {
            return res.status(400).json({ msg: "Nome e número máximo de alunos são obrigatórios!" });
        }

        try {
            const newCourse: Course = await courseService.createCourse(nome, Number(maxAlunos));
            return res.status(201).json({ newCourse, msg: "Curso criado com sucesso!" });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ msg: "Erro ao criar curso!" });
        }
    },

    /**
     * Atualiza o nome e/ou a capacidade máxima de alunos de um curso específico (ID).
     * Rota acessível por Administrador e Professor.
     */
    updateCourse: async(req: Request, res: Response) => {
        const { id } = req.params;
        const { nome, maxAlunos } = req.body;

        if (!nome && !maxAlunos){
            return res.status(400).json({msg: "Nada para atualizar!"});
        }

        try {
            const updatedCourse: Course | null = await courseService.updateCourse(Number(id), nome, maxAlunos);

            if(!updatedCourse){
                return res.status(404).json({msg: "Curso não encontrado!"});
            }

            return res.status(200).json({ updatedCourse, msg: "Dados do curso atualizados com sucesso!"});
        }catch (err){
            console.error(err);
            return res.status(500).json({msg: "Erro ao atualizar curso!"});
        }
    },

    /**
     * Deleta um curso específico (ID).
     * Rota exclusiva para Administradores.
     */
    deleteCourse: async (req: Request, res: Response) => {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ msg: "ID do curso a ser removido não informado!" });
        }

        try {
            const courseDeleted = await courseService.deleteCourse(Number(id));

            if (!courseDeleted) {
                return res.status(404).json({ msg: "Curso não encontrado!" });
            }

            return res.status(200).json({ result: courseDeleted, msg: "Curso removido com sucesso!" });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ msg: "Erro ao deletar curso!" });
        }
    }
}   

export default courseController;