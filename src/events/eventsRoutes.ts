import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";
import { EventsController } from "./eventsController.js";

const router = Router()
const eventsController = new EventsController()

router.post('/', authMiddleware, adminMiddleware, (req, res, next) => eventsController.createEvent(req, res, next))

export default router