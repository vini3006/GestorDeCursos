import db from '../config/database';
import { Subject } from '../models/subject-model';

// Objeto de serviço com funções de CRUD para a entidade Matéria (Disciplina).
const subjectService = {
    /**
     * Lista todas as matérias cadastradas na tabela 'materia'.
     */
    getAll: async(): Promise<Subject[]> => { //lista todas as materias do curso
        const [rows] = await db.execute(`SELECT * FROM materia;`);

        const subjects = rows as Subject[];

        return subjects;
    },

    /**
     * Insere uma nova matéria na tabela 'materia'.
     * Argumentos: nome, período e idCurso.
     * Retorna o objeto da nova matéria criada.
     */
    createSubject: async(nome: string, periodo: number, idCurso: number): Promise<Subject> => {
        const [result]:any = await db.execute(`INSERT INTO materia (nome, periodo, idCurso) VALUES (?, ?, ?);`, [nome, periodo, idCurso]);

        const newSubject = new Subject(result.insertId, nome, periodo);

        return newSubject;
    },

    /**
     * Busca e retorna uma matéria específica usando o ID.
     * Retorna a matéria encontrada ou null se não existir.
     */
    getSubjectById: async(id: number): Promise<Subject | null> => {
        const [rows] = await db.execute(`SELECT * FROM materia WHERE id = ?;`, [id]);

        const subjects = rows as Subject[];

        if(subjects.length === 0){
            return null;
        }

        return subjects[0];
    },

    /**
     * Atualiza o nome e/ou o período de uma matéria existente (via ID).
     * Monta a query UPDATE dinamicamente com base nos campos opcionais fornecidos.
     * Retorna o objeto da matéria atualizada ou null se o ID não for encontrado.
     */
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

        // Se nenhum campo foi atualizado.
        if (updates.length === 0) {
            return subject;
        }

        // Adiciona o ID para a cláusula WHERE
        values.push(id);

        await db.execute(`UPDATE materia SET ${updates.join(", ")} WHERE id = ?;`, values);

        // Retorna o objeto atualizado.
        return new Subject(id, nome ?? subject.nome! ,periodo ?? subject.periodo!);
    },

    /**
     * Remove uma matéria da tabela 'materia' com base no ID.
     * Retorna { deleted: true } se a matéria foi removida ou null se o ID não for encontrado.
     */
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