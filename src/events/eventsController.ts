import type { Request, Response, NextFunction } from "express";
import { createEventSchema } from "./eventsValidator.js";
import { EventsService } from "./eventsService.js";

const eventsService = new EventsService()

export class EventsController{
    async createEvent(req: Request, res: Response, next: NextFunction){
        try {
            const validateData = createEventSchema.parse(req.body)
            const event = await eventsService.createEvents(validateData)
            return res.status(201).json({ status: "success", data: event })
        } catch (error) {
            next(error)
        }
    }
}