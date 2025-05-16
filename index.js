import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import 'dotenv/config'
import connect from './config/db.js'
import indexRouter from './routes/indexRouter.js'
import authRouter from './routes/auth.js'

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
app.use('/auth', authRouter)

export default app
