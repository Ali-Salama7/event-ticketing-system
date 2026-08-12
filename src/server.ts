import express from 'express'
import 'dotenv/config'
import redis  from './config/redis.js'
import authRoute from './auth/authRoutes.js'
import eventsRoute from './events/eventsRoutes.js'
import bookingsRoute from './booking/bookingsRoutes.js'
import { errorHandle } from './middleware/errorHandler.js'

const app = express()
const PORT = process.env.PORT || 3000
app.use(express.json())

app.use('/auth', authRoute)
app.use('/events', eventsRoute)
app.use('/bookings', bookingsRoute)

app.use(errorHandle)

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`)
})
