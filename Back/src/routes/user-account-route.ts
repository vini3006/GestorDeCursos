import { Router } from "express"; //arquivo que define as rotas-padrão de usuarios
import userController from "../controller/user-account-controller";
import { auth } from "../middlewares/auth";
import { allowRoles } from "../middlewares/roles";

const router = Router();

router.post("/login", userController.login); //realiza o login do usuario

router.get("/", auth, allowRoles("administrador"), userController.getAllUsers); //lista todos os usuarios do sistema
router.put("/", auth, userController.updateAccount); //atualização de conta feita pelo próprio usuário
router.post("/admin/", auth, allowRoles("administrador"), userController.insertUser); //inserção de um novo usuário feita pelo administrador
router.delete("/admin/:matricula", auth, allowRoles("administrador"), userController.deleteAccount); //deleção de um usuário, também feita apenas por administradores
router.get("/account", auth, allowRoles("administrador"), userController.getAllAcounts); //lista todas as contas do sistema

export default router;