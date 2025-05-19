import express from "express";
import axios from "axios";
const router = express.Router();
import generateKeyAndDesc from "../controllers/openai_keyword/callOpenai.js";
import "dotenv/config";

router.post("/nearplace", async (req, res) => {
  const center = req.body.location;
  // console.log(center);
  // res.json(center)
  try {
    const kakaoRespond = await axios
      .get("https://dapi.kakao.com/v2/local/search/keyword.json", {
        headers: {
          Authorization: `KakaoAK ${process.env.KAKAO_KEY}`,
        },
        params: {
          query: "맛집",
          page: 2,
          size: 15,
          category_group_code: "FD6",
          x: center.lng,
          y: center.lat,
          radius: 3000,
        },
      })
      .catch((err) => {
        console.log("에러 발생", err);
      });
    const data = kakaoRespond.data.documents;
    // console.log(data)
    res.status(200).json(data);
  } catch (err) {
    // console.log(err);
    res.status(500).send("카카오 api 호출 실패");
  }
});
router.post("/search", async (req, res) => {
  const query = req.body.place;
  const center = req.body.center;
  const categoryCode = ['FD6', 'CE7']
  try {
    // console.log("검색어:", query);
    // console.log("좌표", center);
    
    const requests = categoryCode.map(code => 
      axios
      .get("https://dapi.kakao.com/v2/local/search/keyword.json", {
        headers: {
          Authorization: `KakaoAK ${process.env.KAKAO_KEY}`,
        },
        params: {
          query: query,
          page: 1,
          size: 5,
          category_group_code: code,
          x: center.lng,
          y: center.lat,
          radius: 3000,
        },
      })
      .catch((err) => {
        console.log("에러 발생", err);
      })
    )
    const kakaoResponse = await Promise.all(requests)
    const kakaoData = kakaoResponse.flatMap(res => res.data.documents);
    // console.log("가게정보", kakaoData);


    const data = await Promise.all(
      kakaoData.map(async (kd) => {
        const summary = await generateKeyAndDesc({
          category: kd.category_name,
          address_name: kd.address_name,
          place_name: kd.place_name,
        });
        return {
          ...kd,
          summary
        }
      })
    )
    // console.log('간단정보:',data)
    res.status(200).json(data);
  } catch (err) {
    // console.log(err);
    res.status(500).send("카카오 api 호출 실패");
  }
});

export default router;
