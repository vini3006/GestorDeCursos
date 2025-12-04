import { Request, Response } from "express"; //gerenciamento das requisições
import subjectService from "../services/subject-service";
import { Subject } from "../models/subject-model";

const subjectController = {
    getAll: async(req: Request, res:Response) => {
        try {
            const [subjects]: Subject[] = await subjectService.getAll();
            return res.status(200).json(subjects);
        } catch (err){
            console.error(err);
            return res.status(500).json({msg: "Erro ao buscar disciplinas!"});
        }
    },

    createSubject: async(req: Request, res: Response) => {
        const { nome, periodo } = req.body;

        if(!nome || !periodo){
            return res.status(400).json({msg: "Nome e período são obrigatórios!"});
        }

        try {
            const newSubject: Subject = await subjectService.createSubject(nome, periodo);
            return res.status(201).json({newSubject, msg: "Disciplina inserida com sucesso!"});
        } catch (err){
            console.error(err);
            return res.status(500).json({msg: "Erro ao inserir disciplina!"});
        }
    },

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