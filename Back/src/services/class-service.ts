import db from "../config/database"
import { Class } from "../models/class-model"
import queueService from "./queue-service";

const classService = {
    getAll: async(): Promise<any[]> => {
        const [rows]: any = await db.execute(`
            SELECT 
                t.*, 
                m.nome AS nomeMateria, 
                p.nome AS nomePeriodo, 
                u.nome AS nomeProfessor 
            FROM turma t
            -- JOIN para o nome da Matéria
            JOIN materia m ON t.idMateria = m.id
            -- JOIN para o nome do Período
            JOIN periodoLetivo p ON t.idPeriodoLetivo = p.id 
            -- JOIN para o nome do Professor
            JOIN usuario u ON t.cpfProfessor = u.cpf
            ORDER BY t.dataFechamentoFila ASC;
        `);

        // O controller espera um array de classes, e é isso que ele recebe.
        return rows;
    },

    createClass: async(idMateria: number, cpfProfessor: string, maxAlunos: number, idPeriodoLetivo: number, dataFechamentoFila:Date): Promise<Class> => {
        const [result]: any = await db.execute(`INSERT INTO turma (idMateria, cpfProfessor, maxAlunos, idPeriodoLetivo, dataFechamentoFila) VALUES (?, ?, ?, ?, ?)`, [idMateria, cpfProfessor, maxAlunos, idPeriodoLetivo, dataFechamentoFila]);

        const newClass = new Class(result.insertId, idMateria, cpfProfessor, 0, maxAlunos, idPeriodoLetivo, dataFechamentoFila);

        return newClass;
    },

    tryEnrolling: async(cpfAluno: string, idTurma: number): Promise<{ status: 'INSERTED' | 'ALREADY_QUEUED' | 'PROFESSOR_BLOCKED' | 'NOT_FOUND' }> => {
        const [classRows]: any = await db.execute(`SELECT cpfProfessor FROM turma WHERE id = ?;`, [idTurma]);

        if (classRows.length === 0){
            return { status : 'NOT_FOUND' };
        }

        const cpfProfessor = classRows[0].cpfProfessor;

        if (cpfProfessor === cpfAluno){
            return { status: 'PROFESSOR_BLOCKED' };
        }

        const inserted = await queueService.insertInQueue(cpfAluno, idTurma);

            if (inserted) {
                return { status: 'INSERTED' };
            } else {
                return { status: 'ALREADY_QUEUED' };
            }
    },

    processWaitingList: async(idTurma: number): Promise<{ processed: boolean, inserted: number}> => {
        const [classRows]: any = await db.execute(`SELECT idMateria, maxAlunos, numAlunos, dataFechamentoFila FROM turma WHERE id = ?`,[idTurma]);

        const processingClass = classRows[0];

        if (!processingClass) {
            return { processed: false, inserted: 0 };
        }

        const now = new Date();
        const closingDate = new Date(processingClass.dataFechamentoFila);

        if(now < closingDate){
            return { processed: false, inserted: 0 };
        }

        let availableSeats = processingClass.maxAlunos - processingClass.numAlunos;
        
        const [queueRows]: any = await db.execute(`SELECT id, cpfAluno, prioridade FROM filaEspera WHERE idTurma = ? ORDER BY prioridade DESC, id ASC`, [idTurma]);

        if(queueRows.length === 0){
            return { processed: false, inserted: 0 };
        }

        let inserted = 0;

        for (const item of queueRows){
            if (availableSeats <= 0) break;

            await db.execute(`INSERT INTO matriculas (cpfAluno, idTurma) VALUES (?, ?);`, [item.cpfAluno, idTurma]);
            await db.execute(`DELETE FROM filaEspera WHERE id = ?`, [item.id]);

            inserted++; 
            availableSeats--;
        }

        if (inserted > 0){
            await db.execute(`UPDATE turma SET numAlunos = numAlunos + ? WHERE id = ?;`, [inserted, idTurma]);

            await db.execute(`UPDATE notificacoes SET lida = TRUE WHERE idTurma = ?;`, [idTurma]);
        }

        const fullClass = availableSeats <= 0;
        const inQueueRemaining = queueRows.length > 0;

        if(fullClass && inQueueRemaining){
            const [notifExists]: any = await db.execute(`SELECT 1 FROM notificacoes WHERE idTurma = ? AND lida = FALSE`, [idTurma]);
            
            if(notifExists.length === 0){
                const [subjectRows]: any = await db.execute(`SELECT nome FROM materia WHERE id = ?;`, [processingClass.idMateria]);
                const subjectName = subjectRows[0].nome

                const msg = `Sua turma de ${subjectName} atingiu o limite de vagas e ainda há alunos na fila de espera!`;

                await db.execute(`INSERT INTO notificacoes (cpfProfessor, idTurma, mensagem) VALUES (?, ?, ?)`, [processingClass.cpfProfessor, idTurma, msg]);
            }
        }
        
        return { processed: inserted > 0, inserted: inserted };
    },

    getAllFromProfessor: async(cpfProfessor: string): Promise< { classes: Class[], hasClasses: boolean }> => {
        const [classRows] = await db.execute(`SELECT t.id, t.cpfProfessor, t.numAlunos, t.maxAlunos, m.nome AS nomeMateria,  p.nome AS nomePeriodoLetivo FROM turma t JOIN materia m ON t.idMateria = m.id JOIN periodoLetivo p ON t.idPeriodoLetivo = p.id WHERE t.cpfProfessor = ?;`, [cpfProfessor]);

        const classes = classRows as Class[];

        return { classes, hasClasses: classes.length > 0 };
    },

    getAllStudentsFromClass: async(idTurma: number): Promise<any> => {
        const[classRows]: any = await db.execute(`SELECT u.nome, m.cpfAluno, m.notaP1, m.notaP2, m.notaPF, m.mediaFinal FROM usuario u JOIN matriculas m ON u.cpf = m.cpfAluno WHERE m.idTurma = ?;`, [idTurma]);

        return classRows;
    },

    evaluateStudent: async (cpfAluno: string, idTurma: number, notaP1?: number, notaP2?: number, notaPF?: number): Promise<any | null> => {
        const [enrollRows]: any = await db.execute(`SELECT * FROM matriculas WHERE cpfAluno = ? AND idTurma = ?;`,[cpfAluno, idTurma]);

        if (enrollRows.length === 0) {
            return null;
        }

        const enrollment = enrollRows[0];

        const updates: string[] = [];
        const values: any[] = [];

        if (notaP1 !== undefined) {
            updates.push("notaP1 = ?");
            values.push(notaP1);
            enrollment.notaP1 = notaP1;
        }

        if (notaP2 !== undefined) {
            updates.push("notaP2 = ?");
            values.push(notaP2);
            enrollment.notaP2 = notaP2;
        }

        if (notaPF !== undefined) {
            updates.push("notaPF = ?");
            values.push(notaPF);
            enrollment.notaPF = notaPF;
        }

        if (updates.length === 0) {
            return enrollment;
        }

        let final: number | null = null;

        const p1 = enrollment.notaP1;
        const p2 = enrollment.notaP2;
        const pf = enrollment.notaPF;

        if (p1 !== null && p2 !== null) {
            final = (p1 + p2) / 2;

            if (pf !== null) {
                final = (final + pf) / 2;
            }
        }

        if (final !== null) {
            updates.push("mediaFinal = ?");
            values.push(final);
        }

        values.push(cpfAluno);
        values.push(idTurma);

        await db.execute(`UPDATE matriculas SET ${updates.join(", ")} WHERE cpfAluno = ? AND idTurma = ?;`,values);

        return {cpfAluno, idTurma, notaP1: enrollment.notaP1, notaP2: enrollment.notaP2, notaPF: enrollment.notaPF, mediaFinal: final ?? enrollment.mediaFinal};
    },

    registerMaterial: async(cpfProfessor: string, idTurma: number, titulo: string, link:string, descricao?: string): Promise<any | null>=> {
        const [classRows]: any = await db.execute(`SELECT * FROM turma WHERE id = ? AND cpfProfessor = ?;`,[idTurma, cpfProfessor]);

        if(classRows.length === 0){
            return null;
        }
    
        const [result]: any = await db.execute(`INSERT INTO material (idTurma, titulo, descricao, link) VALUES (?, ?, ?, ?);`, [idTurma, titulo, descricao ?? null, link]);

        return { id: result.insertId, idTurma, titulo, descricao: descricao ?? null, link };
    },

    registerActivity: async(cpfProfessor: string, idTurma: number, titulo: string, descricao: string, dataFechamento: Date, notaMaxima: number): Promise<any | null> => {
        const [classRows]: any = await db.execute(`SELECT * FROM turma WHERE id = ? AND cpfProfessor = ?;`,[idTurma, cpfProfessor]);

        if(classRows.length === 0){
            return null;
        }

        const [result]: any = await db.execute(`INSERT INTO atividade_avaliativa (idTurma, titulo, descricao, dataFechamento, notaMaxima) VALUES (?, ?, ?, ?, ?);`, [idTurma, titulo, descricao, dataFechamento, notaMaxima]);

        return { id: result.insertId, idTurma, titulo, descricao, dataFechamento, notaMaxima };
    },

    getMaterialsFromClass: async(cpfAluno: string, idTurma: number): Promise<any[] | null> => {
        // 1. Verifica se o aluno está matriculado
        const [enrollRows]: any = await db.execute(
            `SELECT * FROM matriculas WHERE cpfAluno = ? AND idTurma = ?;`, 
            [cpfAluno, idTurma]
        );

        if (enrollRows.length === 0) {
            return null; // Aluno não está matriculado na turma
        }
        
        // 2. Busca o nome da matéria E os materiais em uma única query (JOINs)
        // Usamos um LEFT JOIN se for mais simples, mas se a turma não existir, a matrícula falharia.
        // Usaremos um JOIN limpo para garantir que a turma seja válida.
        const [materials]: any = await db.execute(`
            SELECT 
                mat.*,
                m.nome AS className  -- 🚨 Nome da Matéria inserido em cada linha
            FROM material mat
            JOIN turma t ON mat.idTurma = t.id
            JOIN materia m ON t.idMateria = m.id
            WHERE mat.idTurma = ? 
            ORDER BY mat.dataPostagem DESC;
        `, [idTurma]);
        
        return materials;
    },  

    getActivitiesFromClass: async(cpfAluno: string, idTurma: number): Promise<any[] | null> => {
        // 1. Verifica se o aluno está matriculado
        const [enrollRows]: any = await db.execute(
            `SELECT * FROM matriculas WHERE cpfAluno = ? AND idTurma = ?;`, 
            [cpfAluno, idTurma]
        );

        if (enrollRows.length === 0) {
            return null; // Aluno não está matriculado na turma
        }
        
        // 2. Busca as atividades AVALIATIVAS e faz JOIN para obter o nome da matéria
        const [activities]: any = await db.execute(`SELECT aa.*,m.nome AS className FROM atividade_avaliativa aa JOIN turma t ON aa.idTurma = t.id JOIN materia m ON t.idMateria = m.id WHERE aa.idTurma = ? ORDER BY aa.dataFechamento ASC;`, [idTurma]);
        
        return activities;
    },

    sendActivity: async(idAtividade: number, cpfAluno: string, arquivo: string): Promise<any | null> => {
        const[activityRows]: any = await db.execute(`SELECT idTurma, dataFechamento FROM atividade_avaliativa WHERE id = ?;`, [idAtividade]);
        
        if(activityRows.length === 0){
            return null;
        }

        const classId = activityRows[0].idTurma;
        const closingDate: Date = new Date(activityRows[0].dataFechamento);
        const[enrollRows]:any = await db.execute(`SELECT * FROM matriculas WHERE idTurma = ? AND cpfAluno = ?;`, [classId, cpfAluno]);

        if(enrollRows.length === 0){
            return null;
        }

        const now = new Date();
        if(now > closingDate){
            return null;
        }

        await db.execute(`INSERT INTO entrega_atividade (idAtividade, cpfAluno, arquivo) VALUES (?, ?, ?);`, [idAtividade, cpfAluno, arquivo]);

        return { success: true };
    },

    getActivitiesFromClassProfessor: async(cpfProfessor: string, idTurma: number): Promise<any | null> => {
        const [classRows]: any = await db.execute(`SELECT * FROM turma WHERE id = ? AND cpfProfessor = ?;`,[idTurma, cpfProfessor]);

        if (classRows.length === 0) {
            return null;
        }

        const [activities]: any = await db.execute(`SELECT * FROM atividade_avaliativa WHERE idTurma = ? ORDER BY dataFechamento ASC;`,[idTurma]);

        return activities;
    }, 

    evaluateActivity: async(cpfProfessor: string, cpfAluno: string, idAtividade: number, nota: number): Promise<any | null> => {
        const[classRows]: any = await db.execute(`SELECT cpfProfessor FROM turma t JOIN atividade_avaliativa a ON t.id = a.idTurma WHERE t.cpfProfessor = ? AND a.id = ?;`, [cpfProfessor, idAtividade]);

        if(classRows.length === 0){
            return null;
        }

        await db.execute(`UPDATE entrega_atividade SET nota = ? WHERE cpfAluno = ? AND idAtividade = ?;`, [nota, cpfAluno, idAtividade]);

        return nota;
    },

    getGrades: async(cpfAluno: string, idTurma: number): Promise<any | null> => {
        const[enrollRows]: any = await db.execute(`SELECT notaP1, notaP2, notaPF, mediaFinal FROM matriculas WHERE cpfAluno = ? AND idTurma = ?;`, [cpfAluno, idTurma]);

        if(enrollRows.length === 0){
            return null
        }

        const grades = enrollRows[0]

        return { P1: grades.notaP1, P2: grades.notaP2, PF: grades.notaPF, mediaFinal: grades.mediaFinal }
    },

    getAcademicRecord: async(cpfAluno: string): Promise<any | null> => {    
        const query = `SELECT h.notaFinal, h.situacao, h.dataConclusao, m.nome AS nomeMateria, p.nome AS nomePeriodo FROM historico_alunos h JOIN materia m ON m.id = h.idMateria JOIN periodoLetivo p ON p.id = h.idPeriodoLetivo WHERE h.cpfAluno = ?;`

        const [recordRows]: any = await db.execute(query, [cpfAluno]);

        if(recordRows.length === 0){
            return null;
        }

        return recordRows;
    },

    getActiveClassesForStudent: async (cpfAluno: string): Promise<any[]> => {  
        const [classRows]: any = await db.execute(`SELECT t.id, m.nome AS nomeMateria, pl.nome AS nomePeriodo, mat.mediaFinal FROM matriculas mat JOIN turma t ON mat.idTurma = t.id JOIN materia m ON t.idMateria = m.id JOIN periodoLetivo pl ON t.idPeriodoLetivo = pl.id WHERE mat.cpfAluno = ?;`, [cpfAluno]);

        return classRows;
    },
}

export default classService