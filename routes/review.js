import express from 'express'
const router = express.Router();
import regist from '../controllers/store/registReview.js'
import readReviews from '../controllers/store/readReviews.js'
import readAll from '../controllers/store/readAllReviews.js'

router.get('/read/:id', readReviews)
router.post('/readall', readAll)
router.post('/regist', regist)

export default router