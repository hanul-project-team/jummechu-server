import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import path from 'path'
import { fileURLToPath } from 'url'
import 'dotenv/config'
import connect from './config/db.js'
import apiRouter from './routes/api.js'
import authRouter from './routes/auth.js'
import storeRouter from './routes/store.js'
import reviewRouter from './routes/review.js'
import boodmarkRouter from './routes/bookmark.js'
import path from 'path';
import { fileURLToPath } from 'url';

const app = express()
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use('/attachments', express.static(path.join(__dirname, 'attachments')))
app.use('/static', express.static(path.join( __dirname, 'static')))
app.use(cookieParser())
connect()
app.use('/api', apiRouter)
app.use('/auth', authRouter)
// app.use('/api/openai', openaiRoutes)
// app.use('/api/dalle', dalleRoutes)
app.use('/store', storeRouter)
app.use('/review', reviewRouter)
app.use('/bookmark', boodmarkRouter)


app.use('/uploads/profile', express.static(path.join(__dirname, 'uploads', 'profile', 'profileuploads')));
app.use('/static', express.static(path.join(__dirname, 'static')));

export default app