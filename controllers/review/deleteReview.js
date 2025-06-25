import Review from '../../models/review.js'

const deleteReview = async (req, res) => {
    const reviewId = req.params.id
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