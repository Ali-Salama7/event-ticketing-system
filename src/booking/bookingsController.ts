import type { Request, Response, NextFunction } from "express";
import { BookingsService } from "./bookingsService.js";
import { confirmBookingSchema, lockSeatSchema } from "./bookingsValidator.js";
import prisma from "../config/db.js";
import { getUserId } from "../shared/getUserId.js";


const bookingsService = new BookingsService()

export class BookingsController{
    async lockSeat(req: Request, res: Response, next: NextFunction){
        try {
            const validate = lockSeatSchema.parse(req.body)
            const userId =  getUserId(req)

            const result = await bookingsService.lockSeat(userId, {seatId: validate.seatId})
            return res.status(200).json({
                status: "success",
                data: result
            })
        } catch (error) {
            next(error)
        }
    }

    async confirmBooking(req: Request, res: Response, next: NextFunction){
        try {
            const validate = confirmBookingSchema.parse(req.body)
            const userId = getUserId(req)

            const booking = await bookingsService.confirmBooking(userId, validate.seatId)
            return res.status(200).json({
                status: "success",
                data: booking
            })
        } catch (error) {
            next(error)
        }
    }

}