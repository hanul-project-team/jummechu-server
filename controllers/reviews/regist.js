import Review from "../../models/review.js";

const regist = async (req, res) => {
  const data = req.body;
//   console.log(data)
  const newReview = new Review({
    user: data.user,
    comment: data.comment,
    store: data.store,
    rating: data.rating
  })
//   console.log(newReview)
  await newReview.save();
  res.status(201).json({
    msg: '성공적으로 리뷰를 작성하였습니다.'
  })
};

export default regist;
