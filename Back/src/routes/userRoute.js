const {Router} = require("express");
const router = Router();
const controller = require("../controllers/userController");

router.get("/", controller.getUsers); //define a rota padrão dos usuarios

router.put("/", controller.newUser); 

router.delete("/", controller.deleteUser);

module.exports = router;