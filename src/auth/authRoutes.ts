import { Router } from "express";
import { AuthController } from "./authController.js";

const router = Router()
const authController = new AuthController()

router.post('/register', (req, res, next) => authController.register(req, res, next))
router.post('/login', (req, res, next) => authController.login(req, res, next))


export default router