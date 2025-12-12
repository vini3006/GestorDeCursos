import { Router } from "express";
import classController from "../controller/class-controller";
import { auth } from "../middlewares/auth";
import { allowRoles } from "../middlewares/roles";

const router = Router();

// Rotas Gerais de Turma
router.get("/", auth, allowRoles("administrador", "aluno"), classController.getAll); // Lista todas as turmas disponíveis (acesso Admin/Aluno).
router.post("/admin", auth, allowRoles("administrador"), classController.createClass); // Cria uma nova turma (apenas Admin).
router.put("/processQueue/:idTurma", auth, allowRoles("administrador", "professor"), classController.processWaitingList); // Processa a fila de espera de uma turma (Admin/Professor).

// Rotas de Aluno
router.post("/student/:idTurma", auth, allowRoles("aluno"), classController.tryEnrolling); // Tenta se matricular em uma turma; se lotada, entra na fila.
router.get("/student/materials/:idTurma", auth, allowRoles("aluno"), classController.getMaterialsFromClass); // Lista materiais didáticos de uma turma.
router.get("/student/activities/:idTurma", auth, allowRoles("aluno"), classController.getActivitiesFromClass); // Lista atividades avaliativas de uma turma.
router.post("/student/activities/send/:idAtividade", auth, allowRoles("aluno"), classController.sendActivity); // Envia a entrega de uma atividade avaliativa.
router.get("/student/:idTurma/grades", auth, allowRoles("aluno"), classController.getGrades); // Visualiza notas de P1, P2, PF e média final na turma.
router.get("/student/academicrecord", auth, allowRoles("aluno"), classController.getAcademicRecord); // Visualiza o histórico acadêmico do aluno.

// Rotas de Professor
router.get("/professor", auth, allowRoles("professor"), classController.getAllFromProfessor); // Lista todas as turmas de um professor logado.
router.get("/professor/students/:idTurma", auth, allowRoles("professor"), classController.getAllStudentsFromClass); // Lista todos os alunos de uma turma específica.
router.patch("/professor/students/:idTurma/:cpfAluno", auth, allowRoles("professor"), classController.evaluateStudent); // Lança ou atualiza notas (P1, P2, PF) de um aluno.
router.post("/professor/registerMaterial/:idTurma", auth, allowRoles("professor"), classController.registerMaterial); // Cadastra um novo material didático em uma turma.
router.post("/professor/registerActivity/:idTurma", auth, allowRoles("professor"), classController.registerActivity); // Cadastra uma nova atividade avaliativa em uma turma.
router.get("/professor/activities/:idTurma", auth, allowRoles("professor"), classController.getActivitiesFromClassProfessor); // Lista atividades de uma turma (visão do professor, com entregas).
router.patch("/professor/activities/:idAtividade/:cpfAluno", auth, allowRoles("professor"), classController.evaluateActivity); // Lança ou atualiza a nota de entrega de uma atividade.

export default router;