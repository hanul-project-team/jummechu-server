import express from 'express'
const router = express.Router()
import saveBookmark from '../controllers/bookmark/saveBookmark.js'
import deleteBookmark from '../controllers/bookmark/deleteBookmark.js'
import readBookmark from '../controllers/bookmark/readBookmark.js'

router.post('/regist/:id', saveBookmark)
router.delete('/delete/:id', deleteBookmark)
router.get('/read/:id', readBookmark)

export default router