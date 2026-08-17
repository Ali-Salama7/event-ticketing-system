import { Queue } from "bullmq";

export const seatExpiryQueue = new Queue("seatExpiry", {
    connection: {
        host: "localhost",
        port: 6379
    }
})