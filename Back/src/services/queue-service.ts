import db from "../config/database"

// Objeto de serviço com funções para gerenciar a Fila de Espera por turmas.
const queueService = {
    /**
     * Retorna todos os alunos que estão na fila de espera para uma turma (idTurma).
     * Retorna CPF do aluno, nome e a data de entrada na fila.
     */
    getAllfromQueue: async(idTurma: number) => {
        const [queueRows]: any = await db.execute(`SELECT f.cpfAluno, u.nome, f.dataEntrada FROM filaEspera f JOIN usuario u ON f.cpfAluno = u.cpf WHERE f.idTurma = ?;`, [idTurma]);

        return queueRows;
    },

    /**
     * Insere um aluno na fila de espera de uma turma.
     * A prioridade de entrada na fila é definida pelo número de reprovações
     * do aluno naquela matéria ('historico_alunos').
     * Impede a inserção se o aluno já estiver na fila.
     * Retorna true se a inserção ocorreu ou false caso contrário (erro ou já existia).
     */
    insertInQueue: async(cpfAluno: string, idTurma: number): Promise<boolean> => {
        // 1. Obtém o idMateria da turma.
        const [classRows]: any = await db.execute(`SELECT idMateria FROM turma WHERE id = ?`, [idTurma]);

        if (!classRows[0]) return false;

        const idMateria = classRows[0].idMateria;

        // 2. Calcula a prioridade contando as reprovações na matéria.
        const [histRows]: any = await db.execute(`SELECT COUNT(*) AS reprovacoes FROM historico_alunos WHERE cpfAluno = ? AND idMateria = ? AND situacao = 'reprovado'`, [cpfAluno, idMateria]);

        const prioridade = Number(histRows[0].reprovacoes);

        // 3. Verifica se o aluno já está na fila.
        const [exists]: any = await db.execute(`SELECT 1 FROM filaEspera WHERE cpfAluno = ? AND idTurma = ?`,[cpfAluno, idTurma]);

        if (exists.length > 0) {
            return false; // Já existe na fila.
        }

        // 4. Insere na fila de espera.
        const [result]: any = await db.execute(`INSERT INTO filaEspera (cpfAluno, idTurma, prioridade) VALUES (?, ?, ?);`, [cpfAluno, idTurma, prioridade]);

        return result.affectedRows > 0;
    },

    /**
     * Verifica se a fila de espera para uma turma está vazia.
     */
    isQueueEmpty: async (idTurma: number): Promise<boolean> => {
        const [rows]: any = await db.execute(`SELECT 1 FROM filaEspera WHERE idTurma = ? LIMIT 1`,[idTurma]);

        return rows.length === 0; // Retorna true se a consulta não achou linhas.
    },

    /**
     * Aceita um aluno da fila, matriculando-o na turma e removendo-o da fila.
     * Aumenta o número máximo de alunos ('maxAlunos') e o número atual ('numAlunos') da turma.
     * Retorna o status da operação.
     */
    acceptOneFromQueue: async(cpfAluno: string, idTurma: number): Promise<"accepted" | "not_found" | "error"> => {
        // 1. Verifica se o aluno está na fila.
        const [queueRows]: any = await db.execute(`SELECT id FROM filaEspera WHERE cpfAluno = ? AND idTurma = ?`, [cpfAluno, idTurma]);

        if (queueRows.length === 0) return "not_found";

        // 2. Verifica se a turma existe.
        const [classRows]: any = await db.execute(`SELECT maxAlunos, numAlunos FROM turma WHERE id = ?`, [idTurma]);

        if (classRows.length === 0) return "error";

        // 3. Aumenta a capacidade e a contagem de alunos na turma.
        await db.execute(`UPDATE turma SET maxAlunos = maxAlunos + 1, numAlunos = numAlunos + 1 WHERE id = ?`, [idTurma]);

        // 4. Insere o aluno na tabela de matrículas.
        await db.execute(`INSERT INTO matriculas (cpfAluno, idTurma) VALUES (?, ?)`,[cpfAluno, idTurma]);

        // 5. Remove o aluno da fila de espera.
        await db.execute(`DELETE FROM filaEspera WHERE cpfAluno = ? AND idTurma = ?`,[cpfAluno, idTurma]);

        return "accepted";
    },

    /**
     * Rejeita um aluno da fila de espera, apenas removendo-o da fila.
     * Retorna o status da operação.
     */
    rejectOneFromQueue: async (cpfAluno: string, idTurma: number): Promise<"rejected" | "not_found" | "error"> => {
        // 1. Verifica se o aluno está na fila.
        const [queueRows]: any = await db.execute(`SELECT id FROM filaEspera WHERE cpfAluno = ? AND idTurma = ?`,[cpfAluno, idTurma]);

        if (queueRows.length === 0) return "not_found";

        // 2. Remove o aluno da fila de espera.
        await db.execute(`DELETE FROM filaEspera WHERE cpfAluno = ? AND idTurma = ?`,[cpfAluno, idTurma]);

        return "rejected";
    }
}   

export default queueService;