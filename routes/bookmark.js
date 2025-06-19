import express from 'express'
const router = express.Router()
import saveBookmark from '../controllers/store/saveBookmark.js'
import deleteBookmark from '../controllers/store/deleteBookmark.js'
import readBookmark from '../controllers/store/readBookmark.js'

router.post('/regist/:id', saveBookmark)
router.delete('/delete/:id', deleteBookmark)
router.get('/read/:id', readBookmark)

export default router