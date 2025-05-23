import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import 'dotenv/config'
import connect from './config/db.js'
import apiRouter from './routes/api.js'
import authRouter from './routes/auth.js'
import openaiRoutes from './routes/openai.js'
import dalleRoutes from './routes/dalle.js'

const app = express()

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())
connect()
app.use('/api', apiRouter)
app.use('/auth', authRouter)
app.use('/api/openai', openaiRoutes)
app.use('/api/dalle', dalleRoutes)

export default app
