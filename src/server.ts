import express from 'express'
import 'dotenv/config'
import redis  from './config/redis.js'
import authRoute from './auth/authRoutes.js'

const app = express()
const PORT = process.env.PORT || 3000
app.use(express.json())

app.use('/auth', authRoute)

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`)
})
