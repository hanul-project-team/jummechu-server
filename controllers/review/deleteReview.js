import Review from '../../models/review.js'

const deleteReview = async (req, res) => {
    const reviewId = req.params.id
    const userId = req.headers.user
    // console.log('리뷰 아이디:',reviewId)
    // console.log('사용자 아이디',userId)
    try {
        const deleteReview = await Review.deleteOne({_id: reviewId})
        if (deleteReview.deletedCount === 1) {
            return res.status(200).json({
                msg: '리뷰 삭제요청 처리 완료'
            })
        }
    } catch(err) {
        console.log(err)
    }
}

export default deleteReview