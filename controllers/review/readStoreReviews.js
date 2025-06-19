import Review from "../../models/review.js";

const readStoreReviews = async (req, res) => {
  const storeId = req.params.id;

  if (storeId === undefined || storeId === null || storeId === "undefined") {
    console.log("storeId를 읽을수 없습니다..");
    return res.status(400).json({
      msg: "잘못된 요청입니다.",
    });
  }
  try {
    const foundReviews = await Review.find({ store: storeId })
      .populate("store", "name address")
      .populate("user", "name");
    if (foundReviews.length < 1) {
      return res.status(204).json(foundReviews);
    }
    res.status(200).json(foundReviews);
  } catch (err) {
    console.log(err);
  }
};

export default readStoreReviews;
