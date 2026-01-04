

import { Router } from "express";
import { auth } from "../auth/auth.middleware";
import { UserController } from "./users.controller";


const router = Router();


router.get("/me", auth, UserController.getProfile);
router.put("/me", auth, UserController.updateProfile);
router.get("/", auth, UserController.listUsers);

export default router;
