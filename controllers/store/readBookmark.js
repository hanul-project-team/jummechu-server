import Bookmark from "../../models/bookmark.js";

const readBookmark = async (req, res) => {
  const user = req.params.id;

  try {
    const foundUserBookmark = await Bookmark.find({ user }).populate(
      "store",
      "_id name address phone photos"
    );

    return res.status(200).json(foundUserBookmark);
  } catch (err) {
    console.error("북마크 데이터 불러오기 실패!", err);
  }
};

export default readBookmark;
