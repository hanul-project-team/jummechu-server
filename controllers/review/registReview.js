import Review from "../../models/review.js";

const regist = async (req, res) => {
  const data = req.body;
  const files = req.files
  // console.log(data)
  // console.log(files)
  if(!data.comment || !data.rating || !data.user) {
    return res.status(400).json({
      msg: '잘못된 입력입니다.'
    })
  }
  const newReview = new Review({
    user: data.user,
    comment: data.comment,
    store: data.store,
    rating: data.rating,
    attachments: files.map(file => "/uploads/attachments/"+file.filename),
  });
  // console.log(newReview)
  await newReview.save();
  const returnReviews = await Review.find({ store: data.store })
    .populate("store", "name address")
    .populate("user", "name");
  if (returnReviews.length < 1) {
    return res.status(204).json(returnReviews);
  }
  res.status(201).json({
    msg: "성공적으로 리뷰를 작성하였습니다.",
    data: returnReviews
  });
};

export default regist;
