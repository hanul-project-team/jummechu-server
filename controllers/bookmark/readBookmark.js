import Bookmark from "../../models/bookmark.js";
import Review from "../../models/review.js"; // 별점 리뷰가 저장된 모델

const readBookmark = async (req, res) => {
  const user = req.params.id;

  try {
    const foundUserBookmark = await Bookmark.find({ user }).populate(
      "store",
      "_id name address phone photos keywords"
    );

    const allReviews = await Review.find();

    // 평균 평점 계산 함수
    const totalRating = (reviews, storeId) => {
      const filteredReviews = reviews?.filter(
        review => review?.store?.toString() === storeId.toString()
      );

      if (filteredReviews.length === 0) return 0;

      const total = filteredReviews?.reduce((acc, r) => acc + (r.rating || 0), 0);
      return Math.round((total / filteredReviews.length) * 10) / 10;
    };

    // 각 store 객체에 rating을 수동으로 추가
    const enrichedBookmarks = foundUserBookmark.map(bookmark => {
      const store = bookmark.store;
      if (store) {
        const rating = totalRating(allReviews, store._id);
        return {
          ...bookmark.toObject(), // Mongoose Document를 JS 객체로 변환
          store: {
            ...store.toObject(),
            rating: rating,
          },
        };
      }
      return bookmark;
    });



    return res.status(200).json(enrichedBookmarks);
  } catch (err) {
    console.error("북마크 데이터 불러오기 실패!", err);
  }
};

export default readBookmark;
