import {z} from "zod";

export const createEventSchema = z.object({
    name: z.string().min(1),  
    location: z.string().min(1),
    date: z.string().datetime(),
    totalSeats: z.number().int().positive()
})