import { Router } from "express";
import classController from "../controller/class-controller";
import { auth } from "../middlewares/auth";
import { allowRoles } from "../middlewares/roles";

const router = Router();

router.get("/", auth, allowRoles("administrador", "aluno"), classController.getAll);
router.post("/admin", auth, allowRoles("administrador"), classController.createClass);
router.post("/student/:idTurma", auth, allowRoles("aluno"), classController.tryEnrolling);
router.put("/processarEspera/:idTurma", auth, allowRoles("administrador", "professor"), classController.processWaitingList);
router.get("/professor", auth, allowRoles("professor"), classController.getAllFromProfessor);
router.get("/professor/students/:idTurma", auth, allowRoles("professor"), classController.getAllStudentsFromClass);
router.patch("/professor/students/:idTurma/:cpfAluno", auth, allowRoles("professor"), classController.evaluateStudent);
router.post("/professor/registerMaterial/:idTurma", auth, allowRoles("professor"), classController.registerMaterial);
router.post("/professor/registerActivity/:idTurma", auth, allowRoles("professor"), classController.registerActivity);
router.get("/student/materials/:idTurma", auth, allowRoles("aluno"), classController.getMaterialsFromClass);
router.get("/student/activities/:idTurma", auth, allowRoles("aluno"), classController.getActivitiesFromClass);
router.post("/student/activities/send/:idAtividade", auth, allowRoles("aluno"), classController.sendActivity);
router.get("/professor/activities/:idTurma", auth, allowRoles("professor"), classController.getActivitiesFromClassProfessor);
router.patch("/professor/activities/:idAtividade/:cpfAluno", auth, allowRoles("professor"), classController.evaluateActivity);
router.get("/student/:idTurma/grades", auth, allowRoles("aluno"), classController.getGrades);
router.get("/student/academicrecord", auth, allowRoles("aluno"), classController.getAcademicRecord);

export default router;