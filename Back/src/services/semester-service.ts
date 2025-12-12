import db from '../config/database'; // Acesso direto ao banco de dados
import { Semester } from '../models/semester-model';

// Objeto de serviço com funções de CRUD para a entidade Periodo Letivo.
const semesterService = {
    /**
     * Lista todos os períodos letivos cadastrados na tabela 'periodoLetivo'.
     */
    getAll: async(): Promise<Semester[]> => { //lista todos os períodos do BD
        const [rows] = await db.execute(`SELECT * from periodoLetivo;`);

        const semesters = rows as Semester[];

        return semesters;
    },

    /**
     * Cria um novo período letivo no banco de dados.
     * Argumentos: nome, dataInicio e dataFim.
     * Retorna o objeto do novo período criado.
     */
    createSemester: async(nome: string, dataInicio: Date, dataFim: Date): Promise<Semester> => { //cria um novo período letivo no banco de dados
        const [result]: any = await db.execute(`INSERT INTO periodoLetivo (nome, dataInicio, dataFim) VALUES (?, ?, ?);`, [nome, dataInicio, dataFim]);

        const newSemester = new Semester(result.insertId, nome, dataInicio, dataFim);

        return newSemester;
    },

    /**
     * Seleciona e retorna um período letivo específico pelo seu ID.
     * Retorna o período encontrado ou null se não existir.
     */
    getSemesterById: async(id: number): Promise<Semester | null> => { //seleciona um período pelo seu ID
        const [rows] = await db.execute(`SELECT * FROM periodoLetivo WHERE id = ?;`, [id]);

        const semesters = rows as Semester[];

        if(semesters.length === 0){
            return null;
        }

        return semesters[0];
    },

    /**
     * Atualiza o nome, data de início e/ou data de fim de um período letivo.
     * Monta a query UPDATE dinamicamente com base nos campos opcionais fornecidos.
     * Retorna o objeto atualizado ou null se o ID não for encontrado.
     */
    updateSemester: async(id: number, nome?: string, dataInicio?: Date, dataFim?: Date): Promise<Semester | null> => { //atualiza dados sobre o período
        if (!id) {
            return null;
        }
        // Verifica se o período existe
        const semester: any = await semesterService.getSemesterById(id);

        if (!semester) {
            return null; // ID não existe
        }

        // Monta a lista de campos que serão atualizados
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

        // Se nada foi enviado para atualização, retorna o objeto existente.
        if (updates.length === 0) {
            return semester;
        }

        // Adiciona o ID para a cláusula WHERE.
        values.push(id);

        // Executa o update dinâmico
        await db.execute(`UPDATE periodoLetivo SET ${updates.join(", ")} WHERE id = ?;`,values);

        // Retorna objeto atualizado 
        return { id, nome: nome ?? semester.nome!, dataInicio: dataInicio ?? semester.dataInicio!, dataFim: dataFim ?? semester.dataFim! } as Semester;
    },

    /**
     * Remove um período letivo da tabela 'periodoLetivo' com base no ID.
     * Retorna { deleted: true } se o período foi removido ou null se o ID não for encontrado.
     */
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