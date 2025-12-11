import db from "../config/database";

const notificationService = {
    getAllUnread: async(cpf: string) => {
        const [rows] = await db.execute(`SELECT * FROM notificacoes WHERE cpfProfessor = ? AND lida = FALSE ORDER BY dataCriacao DESC;`, [cpf]);
        return rows;
    },

    markAsReadByTurma: async(idTurma: number): Promise<void> => {
        await db.execute(`UPDATE notificacoes SET lida = TRUE WHERE idTurma = ?;`, [idTurma]);
    }
}

export default notificationService;