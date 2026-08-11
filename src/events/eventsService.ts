import prisma from "../config/db.js";
import { NotFoundError } from "../shared/errors.js";

export class EventsService{
    async createEvents(EventData: {name: string, location: string, date: string, totalSeats: number}){
        const eventDate = new Date(EventData.date)

        const seatsData: {seatNumber: number}[] = []

        for (let i = 1; i <= EventData.totalSeats; i++) {
            seatsData.push({seatNumber: i})
        }

        const event = await prisma.event.create({
            data: {
                name: EventData.name,
                location: EventData.location,
                date: eventDate,
                seats: {
                    create: seatsData
                }
            }
        })
        return event
    }

    async getAllEvents(){
        const events = await prisma.event.findMany()
        return events
    }    

    async getEventsSeats(eventId: number){
        const event = await prisma.event.findUnique({
            where: {id: eventId}
        })

        if(!event){
            throw new NotFoundError("Event not found");
            
        }

        const seats = await prisma.seat.findMany({
            where: {eventId: eventId},        
            orderBy: {seatNumber: 'asc'}
        })

        return seats
    }


}