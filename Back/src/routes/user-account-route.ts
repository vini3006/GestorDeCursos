import { Router } from "express"; //arquivo que define as rotas-padrão de usuarios
import userController from "../controller/user-account-controller";
import { auth } from "../middlewares/auth";
import { allowRoles } from "../middlewares/roles";

const router = Router();

router.post("/login", userController.login);

router.get("/", auth, allowRoles("administrador"), userController.getAll);
router.put("/update", auth, userController.updateAccount);

router.post("/admin/",auth, allowRoles("administrador"), userController.insertUser);
router.delete("/admin/:matricula", auth, allowRoles("administrador"), userController.deleteAccount);

export default router;