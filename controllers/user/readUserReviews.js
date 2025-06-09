import Review from "../../models/review.js";

const readUserReviews = async (req, res) => {
  const userId = req.params.id;

  try {
    const foundReviews = await Review.find({ user: userId })
      .populate("store", "name address")
      .populate("user", "name");

      if(foundReviews.length < 1) {
        return res.status(204).json(foundReviews)
      }
    res.status(200).json(foundReviews);
  } catch (err) {
    console.log(err);
  }
};

export default readUserReviews;
