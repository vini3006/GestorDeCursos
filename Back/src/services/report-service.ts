import db from "../config/database";

const reportService = {
    getAllStudents: async(): Promise<Array<{ nome: string, cpf: string }>> => {
        const [studentRows]: any = await db.execute(`SELECT u.nome, u.cpf FROM usuario u INNER JOIN conta c ON u.cpf = c.cpf WHERE c.tipo = 'aluno';`);

        return studentRows;
    },

    getAllProfessors: async(): Promise<Array<{ nome: string, cpf: string }>> => {
        const [professorRows]: any = await db.execute(`SELECT u.nome, u.cpf FROM usuario u INNER JOIN conta c ON u.cpf = c.cpf WHERE c.tipo = 'professor';`);

        return professorRows;
    },

    numStudentsPerClassFromSubject: async(idMateria: number): Promise<Array<{ idTurma: number, totalAlunos: number }>> =>  {
        const[totalRows]: any = await db.execute(`SELECT t.id AS idTurma, COUNT(m.cpfAluno) AS totalAlunos FROM turma t LEFT JOIN matriculas m ON m.idTurma = t.id WHERE t.idMateria = ? GROUP BY t.id, t.idMateria`, [idMateria]);

        return totalRows;
    },

    avgGradesPerSemesterFromSubject: async(idMateria: number): Promise<Array<{ nomeMateria: string, nomePeriodo: string, media: number }>> => {
        const [avgRows]: any = await db.execute(`SELECT m.nome AS nomeMateria, p.nome AS nomePeriodo, AVG(h.notaFinal) AS media FROM historico_alunos h INNER JOIN materia m ON m.id = h.idMateria INNER JOIN periodoLetivo p ON p.id = h.idPeriodoLetivo WHERE h.idMateria = ? GROUP BY m.nome, p.nome, h.idPeriodoLetivo;`);

        return avgRows;
    },

    studentsBelowFive: async(): Promise<Array<{ nomeAluno: string, cpfAluno: string, nomeMateria: string, nomePeriodo: string, notaFinal: number }>> => {
        const [studentRows]: any = await db.execute(`SELECT u.nome AS nomeAluno, u.cpf AS cpfAluno, m.nome AS nomeMateria, p.nome AS nomePeriodo FROM historico_alunos h INNER JOIN usuario u ON h.cpfAluno = u.cpf INNER JOIN materia m ON h.idMateria = m.id INNER JOIN periodoLetivo p ON h.idPeriodoLetivo = p.id WHERE h.notaFinal < 5.0 ORDER BY h.notaFinal ASC;`);

        return studentRows;
    }, 

    activeClassesFromProfessor: async(cpfProfessor: string): Promise<Array<{ idTurma: number, nomeMateria: string, numAlunos: number }>> => {
        const[classRows]: any = await db.execute(`SELECT t.id AS idTurma, m.nome AS nomeMateria, t.numAlunos AS numAlunos FROM turma t INNER JOIN materia m ON t.idMateria = m.id WHERE t.cpfProfessor = ?;`, [cpfProfessor]);

        return classRows;
    },

    mostActiveClassesProfessor: async() => {
        const[professor] = await db.execute(`SELECT u.nome, u.cpf, COUNT(t.id) AS totalTurmas FROM usuario u INNER JOIN conta c ON u.cpf = c.cpf INNER JOIN turma t ON u.cpf = t.cpfProfessor WHERE c.tipo = 'professor' GROUP BY u.nome, u.cpf ORDER BY totalTurmas DESC LIMIT 1;`);

        return professor;
    },

    betterRatedClasses: async(): Promise<Array<{ nomeMateria: string, nomePeriodo: string, media: number }>> => {
        const[classRows]: any = await db.execute(`SELECT m.nome AS nomeMateria, p.nome as nomePeriodo, avg(h.notaFinal) as media FROM historico_alunos h INNER JOIN materia m ON h.idMateria = m.id INNER JOIN periodoLetivo p ON h.idPeriodoLetivo = p.id GROUP BY h.idMateria, h.idPeriodoLetivo, m.nome, p.nome ORDER BY media DESC LIMIT 3;`);

        return classRows;
    },

    studentProfessors: async(): Promise<Array<{ nomeUsuario: string, cpfUsuario: string }>> => {
        const [userRows]: any = await db.execute(`SELECT u.nome AS nomeUsuario, u.cpf AS cpfUsuario FROM usuario u INNER JOIN conta c ON u.cpf = c.cpf WHERE c.tipo = 'professor' OR c.tipo = 'aluno' GROUP BY u.nome, u.cpf HAVING COUNT(*) = 2;`);

        return userRows;
    },

    mostSubjectsDone: async(): Promise<Array<{ nomeAluno: string, cpfAluno: string, numMaterias: number }>> => {
        const [studentRows]: any = await db.execute(`SELECT u.nome AS nomeAluno, u.cpf AS cpfAluno, COUNT(distinct h.idMateria) as numMaterias FROM usuario u INNER JOIN historico_alunos h ON u.cpf = h.cpfAluno GROUP BY u.nome, u.cpf ORDER BY numMaterias DESC LIMIT 1;`);

        return studentRows;
    }
}

export default reportService;