import express from 'express'
const router = express.Router();
import regist from '../controllers/store/registReview.js'
import readStoreReviews from '../controllers/store/readStoreReviews.js'
import readUserReviews from '../controllers/user/readUserReviews.js'
import readAll from '../controllers/store/readAllReviews.js'
import deleteReview from '../controllers/store/deleteReview.js'
import modifyReview from '../controllers/store/modifyReview.js'
import attach from '../middlewares/multer/attachments.js'

router.get('/read/store/:id', readStoreReviews)
router.get('/read/user/:id', readUserReviews)
router.post('/readall', readAll)
router.post('/regist', attach.array('attachments'), regist)
router.delete('/delete/:id', deleteReview)
router.put('/:id', modifyReview)

export default router