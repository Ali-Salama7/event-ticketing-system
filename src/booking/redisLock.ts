import redis from "../config/redis.js";
import { BadRequestError, ForbiddenError } from "../shared/errors.js";

export async function lockSeat(userId: number, seatId: number){
    const result = await redis.set(
        `seat:${seatId}:lock`,
        userId,
        "EX", 300,
        "NX"
    )

    if(result == null){
        throw new BadRequestError("Seat is already locked by another user");
    }
    return true
}

export async function unlockSeat(seatId: number, userId: number) {
    const lockedByUserId = await redis.get(`seat:${seatId}:lock`)

    if(!lockedByUserId){
        return
    }

    if(Number(lockedByUserId) !== userId){
        throw new ForbiddenError("You cannot unlock a seat locked by another user")
    }

    const result = await redis.del(
        `seat:${seatId}:lock`,
    )
    return result
}