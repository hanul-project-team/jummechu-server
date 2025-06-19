import Review from "../../models/review.js";

const modifyReview = async (req, res) => {
  const reviewId = req.params.id;
  if (!reviewId) {
    res.status(400).json({
      msg: "리뷰ID가 존재하지 않습니다.",
    });
    return;
  }
  const modifiedReview = req.body;
  if (!modifiedReview) {
    res.status(400).json({
      msg: "수정할 리뷰정보를 받지 못했습니다.",
    });
  }
  try {
    const existReview = await Review.findOne({ _id: reviewId });
    if (existReview) {
      const updateReview = await Review.updateOne(
        { _id: reviewId },
        {
          comment: modifiedReview.comment,
          rating: modifiedReview.rating,
        }
      );
      if (updateReview.modifiedCount === 1) {
        res.status(200).json(updateReview);
      }
    }
  } catch (err) {
    res.status(500).json({
      msg: "리뷰 수정에 실패했습니다.",
      data: err,
    });
  }
};

export default modifyReview;
