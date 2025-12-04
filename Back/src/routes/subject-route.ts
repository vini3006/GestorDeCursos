import { Router } from "express"; //rotas relativas às disciplinas do curso
import subjectController from "../controller/subject-controller";
import { auth } from "../middlewares/auth";
import { allowRoles } from "../middlewares/roles";

const router = Router();

router.get("/", auth, subjectController.getAll); //lista todas as disciplinas do curso
router.post("/admin", auth, allowRoles("administrador"), subjectController.createSubject); //adiciona uma nova disciplina à grade
router.put("/admin/:id", auth, allowRoles("administrador"), subjectController.updateSubject); //atualiza os dados relativos a uma disciplina
router.delete("/admin/:id", auth, allowRoles("administrador"), subjectController.deleteSubject); //exclui uma disciplina do banco

export default router;