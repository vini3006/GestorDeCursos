import { Request, Response } from "express"; // Gerenciamento das requisições
import queueService from "../services/queue-service"; // Service para operações na Fila de Espera.
import notificationService from "../services/notification-service"; // Service para operações de Notificação.

const notificationController = {
    /**
     * Lista todas as notificações não lidas para o professor logado (obtido via CPF do token).
     * Rota exclusiva para Professores.
     */
    getAllUnread: async(req: Request, res: Response) => {
        const cpf = (req as any).user.cpf // Extrai o CPF do payload do JWT

        try {
            const result = await notificationService.getAllUnread(cpf);
            return res.status(200).json(result);
        } catch(err){
            console.error(err);
            return res.status(500).json({msg: "Erro ao buscar notificações!"});
        }
    },

    /**
     * Lista todos os alunos na fila de espera de uma turma específica (idTurma).
     * Rota exclusiva para Professores.
     */
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

    /**
     * Aceita um aluno da fila, matriculando-o na turma e removendo-o da fila.
     * Se a fila ficar vazia após a aceitação, as notificações daquela turma são marcadas como lidas.
     * Rota exclusiva para Professores.
     */
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

            // Verifica se a fila ficou vazia e marca as notificações como lidas, se for o caso.
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

    /**
     * Rejeita um aluno da fila, removendo-o.
     * Se a fila ficar vazia após a rejeição, as notificações daquela turma são marcadas como lidas.
     * Rota exclusiva para Professores.
     */
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

            // Verifica se a fila ficou vazia e marca as notificações como lidas, se for o caso.
            const empty = await queueService.isQueueEmpty(Number(idTurma));

            if (empty){
                await notificationService.markAsReadByTurma(Number(idTurma));
            }

            // Retorna sucesso para a rejeição.
            return res.status(200).json({ msg: "Aluno rejeitado com sucesso!" });
        } catch(err){
            console.error(err);
            return res.status(500).json({ msg: "Erro ao processar requisição!"});
        }
    }
}

export default notificationController;