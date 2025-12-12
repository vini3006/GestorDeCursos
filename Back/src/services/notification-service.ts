import db from "../config/database";

// Objeto de serviço com funções para gerenciar as notificações do sistema.
const notificationService = {
    /**
     * Busca todas as notificações não lidas de um professor específico (CPF).
     * As notificações são ordenadas da mais recente para a mais antiga.
     */
    getAllUnread: async(cpf: string) => {
        const [rows] = await db.execute(`SELECT * FROM notificacoes WHERE cpfProfessor = ? AND lida = FALSE ORDER BY dataCriacao DESC;`, [cpf]);
        return rows;
    },

    /**
     * Marca todas as notificações associadas a uma turma (idTurma) como lidas.
     */
    markAsReadByTurma: async(idTurma: number): Promise<void> => {
        await db.execute(`UPDATE notificacoes SET lida = TRUE WHERE idTurma = ?;`, [idTurma]);
    }
}

export default notificationService;