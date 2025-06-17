import Review from "../../models/review.js";

const readReviews = async (req, res) => {
  const requestedPlaces = req.body.places;
  const places = requestedPlaces.flat();

  try {
    const storeIds = places.map((place) => place._id);
    if (!storeIds || storeIds.length < 1) {
      return res.status(500).json({
        msg: "아이디를 불러올수 없습니다.",
      });
    }

    const allReviews = await Review.find({ store: { $in: storeIds } }).populate(
      "store",
      "name address"
    );

    res.status(200).json(allReviews);
  } catch (err) {
    console.log(err);
  }
};

export default readReviews;
