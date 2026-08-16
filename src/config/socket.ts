import { Server } from 'socket.io'
import type {Server as HttpServer} from 'http'

let io: Server

export function initSocket(httpServer: HttpServer){
    io = new Server(httpServer, {
        cors: {origin: "*"}
    })

    io.on("connection", (socket) => {
        console.log("A user connect: ", socket.id)

        socket.on("joinEvent", (eventId: number) => {
            socket.join(`event:${eventId}`)
            console.log(`Socket ${socket.id} joined event:${eventId}`)
        })

        socket.on("disconnect", () => {
            console.log("A user disconnected:", socket.id)
        })
    })
    return io
}

export function getIO(){
    if(!io){
        throw new Error("Socket.io not initialized");
    }
    return io
}