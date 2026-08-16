import prisma from "../config/db.js";
import { lockSeat as redisLockSeat, unlockSeat } from "./redisLock.js";
import { BadRequestError, ForbiddenError, NotFoundError } from "../shared/errors.js";
import redis from "../config/redis.js";
import { getIO } from "../config/socket.js";

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

        getIO().to(`event:${seat.eventId}`).emit("seatLocked", {
            seatId: lockData.seatId,
            lockedBy: userId
        })

        return { message: "Seat locked successfully", seatId: lockData.seatId }
    }

    async confirmBooking(userId: number, seatId: number){
        const result = await redis.get(`seat:${seatId}:lock`)

        if(result == null){
            throw new BadRequestError("No active lock found for this seat. Please lock the seat first.");
        }

        if(Number(result) !== userId){
            throw new ForbiddenError("This seat is locked by another user");
        }

        const booking =  await prisma.$transaction(async (tx) => {
            const createBooking = await tx.booking.create({
                data: {
                    userId: userId,
                    seatId: seatId
                }
            })

            const updateStatus = await tx.seat.update({
                where: {id: seatId},
                data: {
                    seatsStatus: 'BOOKED'
                }
            })
            return createBooking
        })
        await unlockSeat(seatId, userId)

        const seat = await prisma.seat.findUnique({where: {id: seatId}})
        getIO().to(`event:${seat?.eventId}`).emit("seatBooked", {
            seatId: seatId,
            bookedBy: userId
        })

        return booking
    }

}