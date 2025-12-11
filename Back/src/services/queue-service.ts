import db from "../config/database"

const queueService = {
    getAllfromQueue: async(idTurma: number) => {
        const [queueRows]: any = await db.execute(`SELECT f.cpfAluno, u.nome, f.dataEntrada FROM filaEspera f JOIN usuario u ON f.cpfAluno = u.cpf WHERE f.idTurma = ?;`, [idTurma]);

        return queueRows;
    },

    insertInQueue: async(cpfAluno: string, idTurma: number): Promise<boolean> => {
        const [classRows]: any = await db.execute(`SELECT idMateria FROM turma WHERE id = ?`, [idTurma]);

        if (!classRows[0]) return false;

        const idMateria = classRows[0].idMateria;

        const [histRows]: any = await db.execute(`SELECT COUNT(*) AS reprovacoes FROM historico_alunos WHERE cpfAluno = ? AND idMateria = ? AND situacao = 'reprovado'`, [cpfAluno, idMateria]);

        const prioridade = Number(histRows[0].reprovacoes);

        const [exists]: any = await db.execute(`SELECT 1 FROM filaEspera WHERE cpfAluno = ? AND idTurma = ?`,[cpfAluno, idTurma]);

        if (exists.length > 0) {
            return false;
        }

        const [result]: any = await db.execute(`INSERT INTO filaEspera (cpfAluno, idTurma, prioridade) VALUES (?, ?, ?);`, [cpfAluno, idTurma, prioridade]);

        return result.affectedRows > 0;
    },

    isQueueEmpty: async (idTurma: number): Promise<boolean> => {
        const [rows]: any = await db.execute(`SELECT 1 FROM filaEspera WHERE idTurma = ? LIMIT 1`,[idTurma]);

        return rows.length === 0;
    },

    acceptOneFromQueue: async(cpfAluno: string, idTurma: number): Promise<"accepted" | "not_found" | "error"> => {
        const [queueRows]: any = await db.execute(`SELECT id FROM filaEspera WHERE cpfAluno = ? AND idTurma = ?`, [cpfAluno, idTurma]);

        if (queueRows.length === 0) return "not_found";

        const [classRows]: any = await db.execute(`SELECT maxAlunos, numAlunos FROM turma WHERE id = ?`, [idTurma]);

        if (classRows.length === 0) return "error";

        await db.execute(`UPDATE turma SET maxAlunos = maxAlunos + 1, numAlunos = numAlunos + 1 WHERE id = ?`, [idTurma]);

        await db.execute(`INSERT INTO matriculas (cpfAluno, idTurma) VALUES (?, ?)`,[cpfAluno, idTurma]);

        await db.execute(`DELETE FROM filaEspera WHERE cpfAluno = ? AND idTurma = ?`,[cpfAluno, idTurma]);

        return "accepted";
    },

    rejectOneFromQueue: async (cpfAluno: string, idTurma: number): Promise<"rejected" | "not_found" | "error"> => {
        const [queueRows]: any = await db.execute(`SELECT id FROM filaEspera WHERE cpfAluno = ? AND idTurma = ?`,[cpfAluno, idTurma]);

        if (queueRows.length === 0) return "not_found";

        await db.execute(`DELETE FROM filaEspera WHERE cpfAluno = ? AND idTurma = ?`,[cpfAluno, idTurma]);

        return "rejected";
    }
}   

export default queueService;