import db from "../config/database";
import { Course } from "../models/course-model";

const courseService = {
    getAll: async(): Promise<Course[]> => {
        const [rows] = await db.execute(`SELECT * FROM curso;`);

        const courses = rows as Course[];

        return courses;
    },

    getCourseById: async(id: number): Promise<Course | null> => {
        const [rows] = await db.execute(`SELECT * FROM curso WHERE id = ?`, [id]);

        const courses = rows as Course[];

        if(courses.length === 0){
            return null;
        }
        return courses[0];
    },

    createCourse: async(nome: string, maxAlunos: number): Promise<Course> => {
        const [result]: any = await db.execute(
            `INSERT INTO curso (nome, maxAlunos) VALUES (?, ?)`,
            [nome, maxAlunos]
        );

        const newCourse = new Course(result.insertId, nome, maxAlunos);

        return newCourse;
    },

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

        if(updates.length === 0){
            return course;
        }

        values.push(id);

        await db.execute(`UPDATE curso SET ${updates.join(", ")} WHERE id = ?`, values);

        return new Course(id, nome ?? course.nome!, maxAlunos ?? course.maxAlunos!);
    },

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