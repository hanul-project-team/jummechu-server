import express from 'express'
const router = express.Router();
import regist from '../controllers/reviews/regist.js'
import readReviews from '../controllers/reviews/readReviews.js'
import readAll from '../controllers/reviews/readAllReviews.js'

router.get('/read/:id', readReviews)
router.post('/readall', readAll)
router.post('/regist', regist)

export default router