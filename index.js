import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import 'dotenv/config'
import connect from './config/db.js'
import indexRouter from './routes/indexRouter.js'
import apiRouter from './routes/apiRouter.js'
import authRouter from './routes/auth.js'
import openaiRoutes from './routes/openai.js'

const app = express()

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())
connect()
app.use('/', indexRouter)
app.use('/api', apiRouter)
app.use('/auth', authRouter)
app.use('/api/openai', openaiRoutes)

export default app
