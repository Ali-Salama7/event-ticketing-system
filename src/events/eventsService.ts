import prisma from "../config/db.js";

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
}