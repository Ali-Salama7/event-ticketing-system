import type { Request, Response, NextFunction } from "express";
import { createEventSchema } from "./eventsValidator.js";
import { EventsService } from "./eventsService.js";
import prisma from "../config/db.js";

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

    async getAllEvents(req: Request, res: Response, next: NextFunction){
        try {
            const events = await eventsService.getAllEvents()
            return res.status(200).json({status: "success", data: events})
        } catch (error) {
            next(error)
        }
    }

    async getEventsSeats(req: Request, res: Response, next: NextFunction){
        try {
            const eventId = Number(req.params.id)
            const seats = await eventsService.getEventsSeats(eventId)
            return res.status(200).json({status: "success", data: seats})
        } catch (error) {
            next(error)
        }
    }

}