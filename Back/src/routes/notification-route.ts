import { Router } from "express";
import notificationController from "../controller/notification-controller";
import { auth } from "../middlewares/auth";
import { allowRoles } from "../middlewares/roles";

const router = Router();

// Rotas de Notificações e Fila de Espera (Acesso exclusivo para Professor)
router.get("/", auth, allowRoles("professor"), notificationController.getAllUnread); // Lista todas as notificações não lidas de um professor.
router.get("/waitingList/:idTurma", auth, allowRoles("professor"), notificationController.getAllfromQueue); // Lista todos os alunos na fila de espera de uma turma específica.
router.put("/waitingList/accept/:idTurma", auth, allowRoles("professor"), notificationController.acceptOneFromQueue); // Aceita (matricula) o aluno na turma e o remove da fila.
router.put("/waitingList/reject/:idTurma", auth, allowRoles("professor"), notificationController.rejectOneFromQueue); // Rejeita e remove o aluno da fila de espera.

export default router;