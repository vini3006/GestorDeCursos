import db from '../config/database';
import { Subject } from '../models/subject-model';

const subjectService = {
    getAll: async(): Promise<Subject[]> => { //lista todas as materias do curso
        const [rows] = await db.execute(`SELECT * FROM materia;`);

        const subjects = rows as Subject[];

        return subjects;
    },

    createSubject: async(nome: string, periodo: number, idCurso: number): Promise<Subject> => {
        const [result]:any = await db.execute(`INSERT INTO materia (nome, periodo, idCurso) VALUES (?, ?, ?);`, [nome, periodo, idCurso]);

        const newSubject = new Subject(result.insertId, nome, periodo);

        return newSubject;
    },

    getSubjectById: async(id: number): Promise<Subject | null> => {
        const [rows] = await db.execute(`SELECT * FROM materia WHERE id = ?;`, [id]);

        const subjects = rows as Subject[];

        if(subjects.length === 0){
            return null;
        }

        return subjects[0];
    },

    updateSubject: async(id: number, nome?: string, periodo?: number): Promise<Subject | null> => {
        const subject = await subjectService.getSubjectById(id);

        if (!subject) {
            return null;
        }

        // Monta as partes que serão atualizadas dinamicamente
        const updates: string[] = [];
        const values: any[] = [];

        if (nome !== undefined) {
            updates.push("nome = ?");
            values.push(nome);
        }

        if (periodo !== undefined) {
            updates.push("periodo = ?");
            values.push(periodo);
        }

        // Se nada foi enviado, retorna o próprio período
        if (updates.length === 0) {
            return subject;
        }

        // Adiciona o ID para o WHERE
        values.push(id);

        await db.execute(`UPDATE materia SET ${updates.join(", ")} WHERE id = ?;`, values);

        // Retorna o objeto atualizado
        return new Subject(id, nome ?? subject.nome! ,periodo ?? subject.periodo!);
    },

    deleteSubject: async(id: number): Promise<{ deleted: boolean } | null> => { 
        const subject = await subjectService.getSubjectById(id); //verifica a existência da disciplina

        if (!subject) {
            return null;
        }

        await db.execute(`DELETE FROM materia WHERE id = ?;`, [id]); //realiza a deleção
        return { deleted: true };
    }
}

export default subjectService;