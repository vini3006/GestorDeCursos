import db from "../config/database";

// Objeto de serviço com funções para gerar diversos relatórios e métricas do sistema.
const reportService = {
    /**
     * Retorna a lista de todos os usuários com conta do tipo 'aluno'.
     * Retorna nome e CPF.
     */
    getAllStudents: async(): Promise<Array<{ nome: string, cpf: string }>> => {
        const [studentRows]: any = await db.execute(`SELECT u.nome, u.cpf FROM usuario u INNER JOIN conta c ON u.cpf = c.cpf WHERE c.tipo = 'aluno';`);

        return studentRows;
    },

    /**
     * Retorna a lista de todos os usuários com conta do tipo 'professor'.
     * Retorna nome e CPF.
     */
    getAllProfessors: async(): Promise<Array<{ nome: string, cpf: string }>> => {
        const [professorRows]: any = await db.execute(`SELECT u.nome, u.cpf FROM usuario u INNER JOIN conta c ON u.cpf = c.cpf WHERE c.tipo = 'professor';`);

        return professorRows;
    },

    /**
     * Calcula o número de alunos matriculados em cada turma de uma matéria específica (idMateria).
     * Retorna ID da turma e o total de alunos.
     */
    numStudentsPerClassFromSubject: async(idMateria: number): Promise<Array<{ idTurma: number, totalAlunos: number }>> =>  {
        const[totalRows]: any = await db.execute(`SELECT t.id AS idTurma, COUNT(m.cpfAluno) AS totalAlunos FROM turma t LEFT JOIN matriculas m ON m.idTurma = t.id WHERE t.idMateria = ? GROUP BY t.id, t.idMateria`, [idMateria]);

        return totalRows;
    },

    /**
     * Calcula a média final das notas por período letivo para uma matéria específica (idMateria).
     * Usa a tabela 'historico_alunos'.
     * Retorna nome da matéria, nome do período e a média.
     */
    avgGradesPerSemesterFromSubject: async(idMateria: number): Promise<Array<{ nomeMateria: string, nomePeriodo: string, media: number }>> => {
        const [avgRows]: any = await db.execute(`SELECT m.nome AS nomeMateria, p.nome AS nomePeriodo, AVG(h.notaFinal) AS media FROM historico_alunos h INNER JOIN materia m ON m.id = h.idMateria INNER JOIN periodoLetivo p ON p.id = h.idPeriodoLetivo WHERE h.idMateria = ? GROUP BY m.nome, p.nome, h.idPeriodoLetivo;`);

        return avgRows;
    },

    /**
     * Lista todos os alunos que reprovaram em alguma matéria (nota final abaixo de 5.0).
     * Retorna nome e CPF do aluno, nome da matéria, nome do período e a nota final.
     */
    studentsBelowFive: async(): Promise<Array<{ nomeAluno: string, cpfAluno: string, nomeMateria: string, nomePeriodo: string, notaFinal: number }>> => {
        const [studentRows]: any = await db.execute(`SELECT u.nome AS nomeAluno, u.cpf AS cpfAluno, m.nome AS nomeMateria, p.nome AS nomePeriodo FROM historico_alunos h INNER JOIN usuario u ON h.cpfAluno = u.cpf INNER JOIN materia m ON h.idMateria = m.id INNER JOIN periodoLetivo p ON h.idPeriodoLetivo = p.id WHERE h.notaFinal < 5.0 ORDER BY h.notaFinal ASC;`);

        return studentRows;
    }, 

    /**
     * Lista as turmas ativas de um professor específico.
     * Retorna ID da turma, nome da matéria e o número de alunos matriculados.
     */
    activeClassesFromProfessor: async(cpfProfessor: string): Promise<Array<{ idTurma: number, nomeMateria: string, numAlunos: number }>> => {
        const[classRows]: any = await db.execute(`SELECT t.id AS idTurma, m.nome AS nomeMateria, t.numAlunos AS numAlunos FROM turma t INNER JOIN materia m ON t.idMateria = m.id WHERE t.cpfProfessor = ?;`, [cpfProfessor]);

        return classRows;
    },

    /**
     * Identifica o professor com o maior número de turmas associadas.
     * Retorna nome, CPF e o total de turmas.
     */
    mostActiveClassesProfessor: async() => {
        const[professor] = await db.execute(`SELECT u.nome, u.cpf, COUNT(t.id) AS totalTurmas FROM usuario u INNER JOIN conta c ON u.cpf = c.cpf INNER JOIN turma t ON u.cpf = t.cpfProfessor WHERE c.tipo = 'professor' GROUP BY u.nome, u.cpf ORDER BY totalTurmas DESC LIMIT 1;`);

        return professor;
    },

    /**
     * Lista as 3 matérias/períodos com as melhores médias finais.
     * Retorna nome da matéria, nome do período e a média.
     */
    betterRatedClasses: async(): Promise<Array<{ nomeMateria: string, nomePeriodo: string, media: number }>> => {
        const[classRows]: any = await db.execute(`SELECT m.nome AS nomeMateria, p.nome as nomePeriodo, avg(h.notaFinal) as media FROM historico_alunos h INNER JOIN materia m ON h.idMateria = m.id INNER JOIN periodoLetivo p ON h.idPeriodoLetivo = p.id GROUP BY h.idMateria, h.idPeriodoLetivo, m.nome, p.nome ORDER BY media DESC LIMIT 3;`);

        return classRows;
    },

    /**
     * Identifica usuários que possuem contas tanto de 'professor' quanto de 'aluno'.
     * Retorna nome e CPF.
     */
    studentProfessors: async(): Promise<Array<{ nomeUsuario: string, cpfUsuario: string }>> => {
        const [userRows]: any = await db.execute(`SELECT u.nome AS nomeUsuario, u.cpf AS cpfUsuario FROM usuario u INNER JOIN conta c ON u.cpf = c.cpf WHERE c.tipo = 'professor' OR c.tipo = 'aluno' GROUP BY u.nome, u.cpf HAVING COUNT(*) = 2;`);

        return userRows;
    },

    /**
     * Identifica o aluno que concluiu o maior número de matérias.
     * Usa a tabela 'historico_alunos' para contar as matérias distintas concluídas.
     * Retorna nome, CPF e o número de matérias.
     */
    mostSubjectsDone: async(): Promise<Array<{ nomeAluno: string, cpfAluno: string, numMaterias: number }>> => {
        const [studentRows]: any = await db.execute(`SELECT u.nome AS nomeAluno, u.cpf AS cpfAluno, COUNT(distinct h.idMateria) as numMaterias FROM usuario u INNER JOIN historico_alunos h ON u.cpf = h.cpfAluno GROUP BY u.nome, u.cpf ORDER BY numMaterias DESC LIMIT 1;`);

        return studentRows;
    }
}

export default reportService;