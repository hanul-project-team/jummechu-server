import Bookmark from "../../models/bookmark.js";

const deleteBookmark = async (req, res) => {
  const user = req.headers.user;
  const store = req.params.id;
  if (!user) {
    return res.status(400).json({
      msg: "사용자 정보가 존재하지 않습니다.",
    });
  }
  if (!store) {
    return res.status(400).json({
      msg: "가게 정보가 존재하지 않습니다.",
    });
  }

  try {
    const delBookmark = await Bookmark.deleteOne({ user, store });
    if(delBookmark.deletedCount === 1) {
      return res.status(200).json({
        msg: "북마크 삭제 처리 완료",
      });
    }
  } catch (err) {
    res.status(500).json({
      msg: "북마크 삭제 요청 에러",
    });
  }
};

export default deleteBookmark;
