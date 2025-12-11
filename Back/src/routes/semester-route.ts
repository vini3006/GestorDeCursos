import { Router } from "express"; //rotas relativas ao gerenciamento dos períodos
import semesterController from "../controller/semester-controller";
import { auth } from "../middlewares/auth";
import { allowRoles } from "../middlewares/roles";

const router = Router();

router.get("admin/", auth, allowRoles("administrador"), semesterController.getAll); //lista todos os períodos do sistema
router.post("admin/", auth, allowRoles("administrador"), semesterController.createSemester); //criação de um novo período 
router.put("admin/:id", auth, allowRoles("administrador"), semesterController.updateSemester); //atualiza dados do período em caso de erro
router.delete("admin/:id", auth, allowRoles("administrador"), semesterController.deleteSemester); //exclui um período

export default router;