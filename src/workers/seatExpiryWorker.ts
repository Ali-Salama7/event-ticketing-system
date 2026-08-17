import { Worker } from "bullmq";
import redis from "../config/redis.js";
import { getIO } from "../config/socket.js";

export const seatExpiryWorker = new Worker(
    "seatExpiry",
    async (job) => {
        const {seatId, eventId} = job.data

        const lockExists = await redis.get(`seat:${seatId}:lock`)
        if(!lockExists){
            getIO().to(`event:${eventId}`).emit("seatExpired", {seatId})
        }
    },
    {
        connection: {host: "localhost", port: 6379}
    }
)