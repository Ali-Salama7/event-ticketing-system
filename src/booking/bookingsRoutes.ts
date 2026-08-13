import { Router } from "express";
import { BookingsController } from "./bookingsController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router()
const bookingsController = new BookingsController()

router.post('/lock', authMiddleware,(req, res, next) => bookingsController.lockSeat(req, res, next))
router.post('/confirm', authMiddleware,(req, res, next) => bookingsController.confirmBooking(req, res, next))

export default router
