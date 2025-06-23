import Bookmark from "../../models/bookmark.js";

const saveBookmark = async (req, res) => {
  const user = req.body.headers.user;
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
    const existBookmark = await Bookmark.findOne({ user, store });
    if (existBookmark) {
      return res.status(400).json({
        msg: "이미 등록되어 있는 북마크입니다.",
      });
    }
    if (!existBookmark || existBookmark.length === 0) {
      const newBookmark = new Bookmark({
        user,
        store,
      });
      await newBookmark.save();
      res.status(201).json(newBookmark);
    }
  } catch (err) {
    res.status(500).json("북마크 등록 요청 에러", err);
  }
};
export default saveBookmark;
