import { Router } from "express";
import courseController from "../controller/course-controller";
import { auth } from "../middlewares/auth";
import { allowRoles } from "../middlewares/roles";

const router = Router();

router.get("/", auth, courseController.getAll);
router.post("/admin", auth, allowRoles("administrador"), courseController.createCourse);
router.put("/:id", auth, allowRoles("administrador", "professor"), courseController.updateCourse);
router.delete("/admin/:id", auth, allowRoles("administrador"), courseController.deleteCourse);

export default router;