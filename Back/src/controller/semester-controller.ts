import { Request, Response } from "express"; //gerenciamento das requisições
import semesterService from "../services/semester-service";
import { Semester } from "../models/semester-model";

const semesterController = {
    getAll: async(req: Request, res: Response) => { //lista todos os períodos presentes no BD
        try {
            const semesters: Semester[] = await semesterService.getAll();
            return res.status(200).json(semesters);
        } catch (err){
            console.error(err);
            return res.status(500).json({msg:"Erro ao buscar períodos!"});
        }
    },

    createSemester: async(req: Request, res: Response) => { //insere um novo período de acordo com os dados passados pelo usuário  (administrador)
        const { nome, dataInicio, dataFim } = req.body;

        if(!nome || !dataInicio || !dataFim){
            return res.status(400).json({msg: "Nome, data de início e data de término do período são obrigatórias"});
        }

        try {
            const newsemester: Semester = await semesterService.createSemester(nome, dataInicio, dataFim);
            return res.status(201).json({newsemester, msg: "Período criado com sucesso!"});
        } catch (err){
            console.error(err);
            return res.status(500).json({msg: "Erro ao criar período!"});
        }   
    },

    updateSemester: async(req:Request, res: Response) => {
        const { id } = req.params;
        const { nome, dataInicio, dataFim } = req.body;

        if(!nome && !dataInicio && !dataFim){
            return res.status(400).json({msg: "Nada para atualizar!"});
        }

        try {
            const updatedsemester: Semester | null = await semesterService.updateSemester(Number(id), nome, dataInicio, dataFim);

            if(!updatedsemester) {
                return res.status(404).json({msg: "Período não encontrado!"});
            }

            return res.status(200).json({updatedsemester, msg: "Dados do período atualizados com sucesso!"});
        } catch (err){
            console.error(err);
            return res.status(500).json({msg: "Erro ao atualizar período!"});
        }
    },

    deleteSemester: async(req: Request, res: Response) => {
        const { id } = req.params;

        if (!id){
            return res.status(400).json({msg: "ID do período a ser removido não informado!"});
        }

        try{
            const semesterDeleted = await semesterService.deleteSemester(Number(id));

            if (!semesterDeleted){
                return res.status(404).json({ msg: "Período não encontrado!" });
            }

            return res.status(200).json({result: semesterDeleted, msg: "Período removido com sucesso!"});
        } catch (err){
            console.error(err);
            return res.status(500).json({msg: "Erro ao deletar período!"});
        }
    }
}

export default semesterController;