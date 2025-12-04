import { Router } from "express"; //rotas relativas ao gerenciamento dos períodos
import periodController from "../controller/period-controller";
import { auth } from "../middlewares/auth";
import { allowRoles } from "../middlewares/roles";

const router = Router();

router.get("admin/", auth, allowRoles("administrador"), periodController.getAll); //lista todos os períodos do sistema
router.post("admin/", auth, allowRoles("administrador"), periodController.createPeriod); //criação de um novo período 
router.put("admin/:id", auth, allowRoles("administrador"), periodController.updatePeriod); //atualiza dados do período em caso de erro
router.delete("admin/:id", auth, allowRoles("administrador"), periodController.deletePeriod); //exclui um período

export default router;