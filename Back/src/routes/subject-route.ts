import { Router } from "express"; // Importa o Router do Express para definição de rotas.
import subjectController from "../controller/subject-controller";
import { auth } from "../middlewares/auth";
import { allowRoles } from "../middlewares/roles";

const router = Router();

// Rotas de Disciplinas (Matérias)
router.get("/", auth, subjectController.getAll); // Lista todas as disciplinas do curso (acesso por usuário logado).
router.post("/admin", auth, allowRoles("administrador"), subjectController.createSubject); // Adiciona uma nova disciplina à grade curricular (apenas Admin).
router.put("/admin/:id", auth, allowRoles("administrador"), subjectController.updateSubject); // Atualiza os dados de uma disciplina pelo ID (apenas Admin).
router.delete("/admin/:id", auth, allowRoles("administrador"), subjectController.deleteSubject); // Exclui uma disciplina do banco pelo ID (apenas Admin).

export default router;