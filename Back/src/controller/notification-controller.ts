import { Request, Response } from "express";
import queueService from "../services/queue-service";
import notificationService from "../services/notification-service";

const notificationController = {
    getAllUnread: async(req: Request, res: Response) => {
        const cpf = (req as any).user.cpf

        try {
            const result = await notificationService.getAllUnread(cpf);
            return res.status(200).json(result);
        } catch(err){
            console.error(err);
            return res.status(500).json({msg: "Erro ao buscar notificações!"});
        }
    },

    getAllfromQueue: async(req: Request, res: Response) => {
        const { idTurma } = req.params;

        if (!idTurma) {
            return res.status(400).json({ msg: "Turma não informada!" });
        }

        try {
            const result = await queueService.getAllfromQueue(Number(idTurma));
            return res.status(200).json(result);
        } catch(err){
            console.error(err);
            return res.status(500).json({msg: "Erro ao buscar alunos da fila de espera!"});
        }
    },

    acceptOneFromQueue: async(req: Request, res: Response) => {
        const { idTurma } = req.params;
        const { cpfAluno } = req.body

        if (!idTurma || !cpfAluno) {
            return res.status(400).json({ msg: "Parâmetros não informados!" });
        }

        try {
            const result = await queueService.acceptOneFromQueue(cpfAluno, Number(idTurma));

            if (result === "not_found") {
                return res.status(404).json({ msg: "Aluno não está na fila de espera." });
            }

            if (result === "error") {
                return res.status(500).json({ msg: "Erro ao aceitar aluno." });
            }

            // Agora o controller só chama o service:
            const empty = await queueService.isQueueEmpty(Number(idTurma));

            if (empty) {
                await notificationService.markAsReadByTurma(Number(idTurma));
            }

            return res.status(200).json({ msg: "Aluno aceito com sucesso!" });

        } catch (err) {
            console.error(err);
            return res.status(500).json({ msg: "Erro ao processar requisição." });
        }
    },

    rejectOneFromQueue: async(req: Request, res: Response) => {
        const { idTurma } = req.params;
        const { cpfAluno } = req.body;

        if (!idTurma || !cpfAluno) {
            return res.status(400).json({ msg: "Parâmetros não informados!" });
        }

        try {
            const result = await queueService.rejectOneFromQueue(cpfAluno, Number(idTurma));

            if (result === "not_found")
            return res.status(404).json({ msg: "Aluno não está na fila." });

            const empty = await queueService.isQueueEmpty(Number(idTurma));

            if (empty){
                await notificationService.markAsReadByTurma(Number(idTurma));
            }
        } catch(err){
            console.error(err);
            return res.status(500).json({ msg: "Erro ao processar requisição!"});
        }
    }
}

export default notificationController;