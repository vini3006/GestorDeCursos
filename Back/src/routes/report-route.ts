import { Router } from "express";
import reportController from "../controller/report-controller";
import { auth } from "../middlewares/auth";
import { allowRoles } from "../middlewares/roles";

const router = Router();

router.get("/allStudents", auth, allowRoles("administrador"), reportController.getAllStudents);
router.get("/allProfessors", auth, allowRoles("administrador"), reportController.getAllProfessors);
router.get("/numStudents/:idMateria", auth, allowRoles("administrador"), reportController.numStudentsPerClassFromSubject);
router.get("/avgGrades/:idMateria", auth, allowRoles("administrador"), reportController.avgGradesPerSemesterFromSubject);
router.get("/belowFive", auth, allowRoles("administrador"), reportController.studentsBelowFive);
router.get("/allClasses/:cpfProfessor", auth, allowRoles("administrador"), reportController.activeClassesFromProfessor);
router.get("/mostClassesProfessor", auth, allowRoles("administrador"), reportController.mostActiveClassesProfessor);
router.get("/betterRatedClasses", auth, allowRoles("administrador"), reportController.betterRatedClasses);
router.get("/both", auth, allowRoles("administrador"), reportController.studentProfessors);
router.get("/mostActiveStudent", auth, allowRoles("administrador"), reportController.mostSubjectsDone);

export default router;