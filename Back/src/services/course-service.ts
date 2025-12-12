import db from "../config/database";
import { Course } from "../models/course-model";

// Objeto de serviço com funções de CRUD para a entidade Curso.
const courseService = {
    /**
     * Lista todos os cursos cadastrados na tabela 'curso'.
     */
    getAll: async(): Promise<Course[]> => {
        const [rows] = await db.execute(`SELECT * FROM curso;`);

        const courses = rows as Course[];

        return courses;
    },

    /**
     * Seleciona e retorna um curso específico pelo seu ID.
     * Retorna o curso encontrado ou null se não existir.
     */
    getCourseById: async(id: number): Promise<Course | null> => {
        const [rows] = await db.execute(`SELECT * FROM curso WHERE id = ?`, [id]);

        const courses = rows as Course[];

        if(courses.length === 0){
            return null;
        }
        return courses[0];
    },

    /**
     * Insere um novo curso na tabela 'curso'.
     * Argumentos: nome do curso e capacidade máxima de alunos.
     * Retorna o objeto do novo curso criado.
     */
    createCourse: async(nome: string, maxAlunos: number): Promise<Course> => {
        const [result]: any = await db.execute(
            `INSERT INTO curso (nome, maxAlunos) VALUES (?, ?)`,
            [nome, maxAlunos]
        );

        const newCourse = new Course(result.insertId, nome, maxAlunos);

        return newCourse;
    },

    /**
     * Atualiza o nome e/ou a capacidade máxima de alunos de um curso existente.
     * Monta a query UPDATE dinamicamente com base nos campos opcionais fornecidos.
     * Retorna o objeto do curso atualizado ou null se o ID não for encontrado.
     */
    updateCourse: async(id: number, nome?: string, maxAlunos?: number): Promise<Course | null> => {
        const course = await courseService.getCourseById(id);

        if(!course){
            return null;
        }

        const updates: string[] = [];
        const values: any[] = [];

        if(nome !== undefined){
            updates.push("nome = ?");
            values.push(nome);
        }

        if(maxAlunos !== undefined){
            updates.push("maxAlunos = ?");
            values.push(maxAlunos);
        }

        // Se nenhum campo foi atualizado, retorna o curso existente.
        if(updates.length === 0){
            return course;
        }

        // Adiciona o ID para a cláusula WHERE.
        values.push(id);

        await db.execute(`UPDATE curso SET ${updates.join(", ")} WHERE id = ?`, values);

        // Retorna o objeto atualizado.
        return new Course(id, nome ?? course.nome!, maxAlunos ?? course.maxAlunos!);
    },

    /**
     * Remove um curso da tabela 'curso' com base no ID.
     * Retorna { deleted: true } se o curso foi removido ou null se o ID não for encontrado.
     */
    deleteCourse: async (id: number): Promise<{ deleted: boolean } | null> => {
        const course = await courseService.getCourseById(id);

        if (!course) {
            return null;
        }

        await db.execute(`DELETE FROM curso WHERE id = ?;`, [id]);

        return { deleted: true };
    },
}

export default courseService;