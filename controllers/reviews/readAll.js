import Review from "../../models/review.js";

const readAll = async (req, res) => {
  const storeId = req.params.id;
  //   console.log(storeId);

  try {
    const foundReviews = await Review.find({ store: storeId })
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

export default readAll;
