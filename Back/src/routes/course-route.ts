import { Router } from "express";
import courseController from "../controller/course-controller";
import { auth } from "../middlewares/auth";
import { allowRoles } from "../middlewares/roles";

const router = Router();

// Rotas de Curso
router.get("/", auth, courseController.getAll); // Lista todos os cursos disponíveis (acesso por usuário logado).
router.post("/admin", auth, allowRoles("administrador"), courseController.createCourse); // Cria um novo curso (apenas Admin).
router.put("/:id", auth, allowRoles("administrador", "professor"), courseController.updateCourse); // Atualiza dados de um curso (Admin ou Professor).
router.delete("/admin/:id", auth, allowRoles("administrador"), courseController.deleteCourse); // Deleta um curso (apenas Admin).

export default router;