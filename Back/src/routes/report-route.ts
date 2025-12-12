import { Router } from "express";
import reportController from "../controller/report-controller";
import { auth } from "../middlewares/auth";
import { allowRoles } from "../middlewares/roles";

const router = Router();

// Rotas de Relatório (Acesso exclusivo para Administrador)
router.get("/allStudents", auth, allowRoles("administrador"), reportController.getAllStudents); // Retorna a lista de todos os alunos.
router.get("/allProfessors", auth, allowRoles("administrador"), reportController.getAllProfessors); // Retorna a lista de todos os professores.
router.get("/numStudents/:idMateria", auth, allowRoles("administrador"), reportController.numStudentsPerClassFromSubject); // Conta o total de alunos por turma, filtrado por idMateria.
router.get("/avgGrades/:idMateria", auth, allowRoles("administrador"), reportController.avgGradesPerSemesterFromSubject); // Calcula a média de notas por período letivo para uma matéria.
router.get("/belowFive", auth, allowRoles("administrador"), reportController.studentsBelowFive); // Lista todos os alunos com nota final inferior a 5.0 (reprovados).
router.get("/allClasses/:cpfProfessor", auth, allowRoles("administrador"), reportController.activeClassesFromProfessor); // Lista as turmas ativas de um professor específico.
router.get("/mostClassesProfessor", auth, allowRoles("administrador"), reportController.mostActiveClassesProfessor); // Identifica o professor com o maior número de turmas.
router.get("/betterRatedClasses", auth, allowRoles("administrador"), reportController.betterRatedClasses); // Lista as 3 matérias/períodos com as melhores médias de nota.
router.get("/both", auth, allowRoles("administrador"), reportController.studentProfessors); // Lista usuários que são alunos e professores simultaneamente.
router.get("/mostActiveStudent", auth, allowRoles("administrador"), reportController.mostSubjectsDone); // Identifica o aluno que concluiu o maior número de matérias.

export default router;