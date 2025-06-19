import express from 'express'
const router = express.Router();
import regist from '../controllers/review/registReview.js'
import readStoreReviews from '../controllers/review/readStoreReviews.js'
import readUserReviews from '../controllers/review/readUserReviews.js'
import readAll from '../controllers/review/readAllReviews.js'
import deleteReview from '../controllers/review/deleteReview.js'
import modifyReview from '../controllers/review/modifyReview.js'
import attach from '../middlewares/multer/attachments.js'

router.get('/read/store/:id', readStoreReviews)
router.get('/read/user/:id', readUserReviews)
router.post('/readall', readAll)
router.post('/regist', attach.array('attachments'), regist)
router.delete('/delete/:id', deleteReview)
router.put('/:id', modifyReview)

export default router