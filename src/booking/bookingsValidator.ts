import z from "zod";

export const lockSeatSchema = z.object({
    seatId: z.number()
})

export const confirmBookingSchema = z.object({
    seatId: z.number(),
})