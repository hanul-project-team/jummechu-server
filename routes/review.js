import express from 'express'
const router = express.Router();
import regist from '../controllers/store/registReview.js'
import readStoreReviews from '../controllers/store/readStoreReviews.js'
import readUserReviews from '../controllers/user/readUserReviews.js'
import readAll from '../controllers/store/readAllReviews.js'
import deleteReview from '../controllers/store/deleteReview.js'

router.get('/read/store/:id', readStoreReviews)
router.get('/read/user/:id', readUserReviews)
router.post('/readall', readAll)
router.post('/regist', regist)
router.delete('/delete/:id', deleteReview)

export default router