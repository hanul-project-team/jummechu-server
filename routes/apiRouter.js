import express from "express";
import axios from "axios";
const router = express.Router();
import 'dotenv/config'

router.post("/search", async (req, res) => {
  const placeName = req.body.name;
  //   console.log(placeName);
  try {
    const document = await axios
      .get("https://dapi.kakao.com/v2/local/search/keyword.json", {
        headers: {
          Authorization: `KakaoAK ${process.env.KAKAO_KEY}`,
        },
        params: {
          query: placeName,
          page: 2,
          size: 10,
        },
      })
      const kakaoPlace = document.data.documents
    //   console.log(kakaoPlace)
    res.status(200).send(kakaoPlace)
  } catch (err) {
    console.log(err);
    res.status(500).send("카카오 api 호출 실패")
  }
});

export default router;
