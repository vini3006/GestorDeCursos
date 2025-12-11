import db from '../config/database'; //acesso direto ao banco de dados
import { Semester } from '../models/semester-model';

const semesterService = {
    getAll: async(): Promise<Semester[]> => { //lista todos os períodos do BD
        const [rows] = await db.execute(`SELECT * from periodoLetivo;`);

        const semesters = rows as Semester[];

        return semesters;
    },

    createSemester: async(nome: string, dataInicio: Date, dataFim: Date): Promise<Semester> => { //cria um novo período letivo no banco de dados
        const [result]: any = await db.execute(`INSERT INTO periodoLetivo (nome, dataInicio, dataFim) VALUES (?, ?, ?);`, [nome, dataInicio, dataFim]);

        const newSemester = new Semester(result.insertId, nome, dataInicio, dataFim);

        return newSemester;
    },

    getSemesterById: async(id: number): Promise<Semester | null> => { //seleciona um período pelo seu ID
        const [rows] = await db.execute(`SELECT * FROM periodoLetivo WHERE id = ?;`, [id]);

        const semesters = rows as Semester[];

        if(semesters.length === 0){
            return null;
        }

        return semesters[0];
    },

    updateSemester: async(id: number, nome?: string, dataInicio?: Date, dataFim?: Date): Promise<Semester | null> => { //atualiza dados sobre o período
        if (!id) {
            return null;
        }
        //Verifica se o período existe
        const semester: any = await semesterService.getSemesterById(id);

        if (!semester) {
            return null; // ID não existe
        }

        //Monta a lista de campos que serão atualizados
        const updates: string[] = [];
        const values: any[] = [];

        if (nome !== undefined) {
            updates.push("nome = ?");
            values.push(nome);
        }

        if (dataInicio !== undefined) {
            updates.push("dataInicio = ?");
            values.push(dataInicio);
        }

        if (dataFim !== undefined) {
            updates.push("dataFim = ?");
            values.push(dataFim);
        }

        // Se nada foi enviado, retorna null
        if (updates.length === 0) {
            return semester;
        }

        // Adiciona o ID no final
        values.push(id);

        // Executa o update dinâmico
        await db.execute(`UPDATE periodoLetivo SET ${updates.join(", ")} WHERE id = ?;`,values);

        // Retorna objeto atualizado 
        return { id, nome: nome ?? semester.nome!, dataInicio: dataInicio ?? semester.dataInicio!, dataFim: dataFim ?? semester.dataFim! } as Semester;
    },

    deleteSemester: async(id: number): Promise<{ deleted: boolean } | null> => { //deleta o período com o ID passado
        const semester = await semesterService.getSemesterById(id) //verifica a existência do período

        if (!semester) {
            return null;
        }

        await db.execute(`DELETE FROM periodoLetivo WHERE id = ?;`, [id]); //realiza a deleção
        return { deleted: true };
    }
}

export default semesterService;