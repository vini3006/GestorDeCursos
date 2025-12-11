import { Router } from "express";
import notificationController from "../controller/notification-controller";
import { auth } from "../middlewares/auth";
import { allowRoles } from "../middlewares/roles";

const router = Router();

router.get("/", auth, allowRoles("professor"), notificationController.getAllUnread);
router.get("/waitingList/:idTurma", auth, allowRoles("professor"), notificationController.getAllfromQueue);
router.put("/waitingList/accept/:idTurma", auth, allowRoles("professor"), notificationController.acceptOneFromQueue);
router.put("/waitingList/reject/:idTurma", auth, allowRoles("professor"), notificationController.rejectOneFromQueue);

export default router;