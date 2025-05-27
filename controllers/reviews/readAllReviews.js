import Review from "../../models/review.js";

const readReviews = async (req, res) => {
  try {
    const allReviews = await Review.find().populate('store', 'name address')
    if(!allReviews || allReviews.length < 1) {
      return res.status(204).json({
        msg: '리뷰 정보가 존재하지 않습니다.'
      })
    }
    res.status(200).json(allReviews);
  } catch (err) {
    console.log(err);
  }
};

export default readReviews;
