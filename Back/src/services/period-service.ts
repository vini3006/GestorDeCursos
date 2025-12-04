import db from '../config/database'; //acesso direto ao banco de dados
import { Period } from '../models/period-model';

const periodService = {
    getAll: async(): Promise<Period[]> => { //lista todos os períodos do BD
        const [rows] = await db.execute(`SELECT * from periodoLetivo;`);

        const periods = rows as Period[];

        return periods;
    },

    createPeriod: async(nome: string, dataInicio: Date, dataFim: Date): Promise<Period> => { //cria um novo período letivo no banco de dados
        const [result]: any = await db.execute(`INSERT INTO periodoLetivo (nome, dataInicio, dataFim) VALUES (?, ?, ?);`, [nome, dataInicio, dataFim]);

        const newPeriod = new Period(result.insertId, nome, dataInicio, dataFim);

        return newPeriod;
    },

    getPeriodById: async(id: number): Promise<Period | null> => { //seleciona um período pelo seu ID
        const [rows] = await db.execute(`SELECT * FROM periodoLetivo WHERE id = ?;`, [id]);

        const periods = rows as Period[];

        if(periods.length === 0){
            return null;
        }

        return periods[0];
    },

    updatePeriod: async(id: number, nome?: string, dataInicio?: Date, dataFim?: Date): Promise<Period | null> => { //atualiza dados sobre o período
        if (!id) {
            return null;
        }
        //Verifica se o período existe
        const period: any = await periodService.getPeriodById(id);

        if (!period) {
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
            return period;
        }

        // Adiciona o ID no final
        values.push(id);

        // Executa o update dinâmico
        await db.execute(`UPDATE periodoLetivo SET ${updates.join(", ")} WHERE id = ?;`,values);

        // Retorna objeto atualizado 
        return { id, nome: nome ?? period.nome!, dataInicio: dataInicio ?? period.dataInicio!, dataFim: dataFim ?? period.dataFim! } as Period;
    },

    deletePeriod: async(id: number): Promise<{ deleted: boolean } | null> => { //deleta o período com o ID passado
        const period = await periodService.getPeriodById(id) //verifica a existência do período

        if (!period) {
            return null;
        }

        await db.execute(`DELETE FROM periodoLetivo WHERE id = ?;`, [id]); //realiza a deleção
        return { deleted: true };
    }
}

export default periodService;