import express from "express";
import axios from "axios";
const router = express.Router();
import "dotenv/config";

router.post("/search", async (req, res) => {
  const placeName = req.body.place;
  const location = req.body.location;
  console.log('검색어:',placeName);
  // console.log('좌표:',location);
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
          category_group_code: "FD6",
          x: location.lng,
          y: location.lat,
          radius: 1500,
        },
      })
      .catch((err) => {
        console.log("에러 발생", err);
      });
    const kakaoPlace = document.data.documents;
    // console.log(document.data);
    res.status(200).send(kakaoPlace);
  } catch (err) {
    // console.log(err);
    res.status(500).send("카카오 api 호출 실패");
  }
});

export default router;
