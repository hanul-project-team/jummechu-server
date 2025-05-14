import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connect from './config/db.js'
import indexRouter from './routes/indexRouter.js'
import apiRouter from './routes/apiRouter.js'

const app = express()

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))
connect()
app.use('/', indexRouter)
app.use('/api', apiRouter)

export default app
