import { Request, Response } from "express"; //gerenciamento das requisições
import periodService from "../services/period-service";
import { Period } from "../models/period-model";

const periodController = {
    getAll: async(req: Request, res: Response) => { //lista todos os períodos presentes no BD
        try {
            const periods: Period[] = await periodService.getAll();
            return res.status(200).json(periods);
        } catch (err){
            console.error(err);
            return res.status(500).json({msg:"Erro ao buscar períodos!"});
        }
    },

    createPeriod: async(req: Request, res: Response) => { //insere um novo período de acordo com os dados passados pelo usuário  (administrador)
        const { nome, dataInicio, dataFim } = req.body;

        if(!nome || !dataInicio || !dataFim){
            return res.status(400).json({msg: "Nome, data de início e data de término do período são obrigatórias"});
        }

        try {
            const newPeriod: Period | null = await periodService.createPeriod(nome, dataInicio, dataFim);
            return res.status(201).json({newPeriod, msg: "Período criado com sucesso!"});
        } catch (err){
            console.error(err);
            return res.status(500).json({msg: "Erro ao criar período!"});
        }   
    },

    updatePeriod: async(req:Request, res: Response) => {
        const { id } = req.params;
        const { nome, dataInicio, dataFim } = req.body;

        if(!nome && !dataInicio && !dataFim){
            return res.status(400).json({msg: "Nada para atualizar!"});
        }

        try {
            const updatedPeriod: Period | null = await periodService.updatePeriod(Number(id), nome, dataInicio, dataFim);

            if(!updatedPeriod) {
                return res.status(404).json({msg: "Período não encontrado!"});
            }

            return res.status(200).json({updatedPeriod, msg: "Dados do período atualizados com sucesso!"});
        } catch (err){
            console.error(err);
            return res.status(500).json({msg: "Erro ao atualizar período!"});
        }
    },

    deletePeriod: async(req: Request, res: Response) => {
        const { id } = req.params;

        if (!id){
            return res.status(400).json({msg: "ID do período a ser removido não informado!"});
        }

        try{
            const periodDeleted = await periodService.deletePeriod(Number(id));

            if (!periodDeleted){
                return res.status(404).json({ msg: "Período não encontrado!" });
            }

            return res.status(200).json({result: periodDeleted, msg: "Período removido com sucesso!"});
        } catch (err){
            console.error(err);
            return res.status(500).json({msg: "Erro ao deletar período!"});
        }
    }
}

export default periodController;