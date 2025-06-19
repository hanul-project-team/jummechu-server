import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import 'dotenv/config'
import connect from './config/db.js'
import apiRouter from './routes/api.js'
import authRouter from './routes/auth.js'
import storeRouter from './routes/store.js'
import reviewRouter from './routes/review.js'
import boodmarkRouter from './routes/bookmark.js'
import openaiRoutes from './routes/openai.js'
import dalleRoutes from './routes/dalle.js'
import { fileURLToPath } from 'url'
import path from 'path'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use('/attachments', express.static(path.join(__dirname, '/uploads/attachments')))
app.use('/static', express.static(path.join( __dirname, 'static')))
app.use(cookieParser())
connect()
app.use('/api', apiRouter)
app.use('/auth', authRouter)
app.use('/api/openai', openaiRoutes)
app.use('/api/dalle', dalleRoutes)
app.use('/store', storeRouter)
app.use('/review', reviewRouter)
app.use('/bookmark', boodmarkRouter)

export default app
