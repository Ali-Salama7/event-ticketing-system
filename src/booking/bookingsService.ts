import prisma from "../config/db.js";
import { lockSeat as redisLockSeat } from "./redisLock.js";
import { BadRequestError, NotFoundError } from "../shared/errors.js";

export class BookingsService{
    async lockSeat(userId: number,lockData: {seatId: number}){
        const seat = await prisma.seat.findUnique({
            where: {id: lockData.seatId}
        })

        if(!seat){
            throw new NotFoundError("Seat not found");
        }

        if(seat.seatsStatus === 'BOOKED'){
            throw new BadRequestError("Seat is already booked");
        }

        await redisLockSeat(userId, lockData.seatId)
        return { message: "Seat locked successfully", seatId: lockData.seatId }
    }
}