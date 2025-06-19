import express from "express";
const router = express.Router();
import axios from "axios";
import generateKeyAndDesc from "../../service/openai_keyword/callOpenai.js";
import "dotenv/config";

router.post("/user/nearplace", async (req, res) => {
  const center = req.body.location;
  if (
    !center ||
    typeof center !== "object" ||
    center.lat == null ||
    center.lng == null
  ) {
    return res.status(400).json({ error: "유효하지 않은 좌표 데이터입니다." });
  }
  // console.log(process.env.KAKAO_KEY)
  try {
    const kakaoRespond = await axios.get(
      "https://dapi.kakao.com/v2/local/search/keyword.json",
      {
        headers: {
          Authorization: `KakaoAK ${process.env.KAKAO_KEY}`,
        },
        // timeout: 3000,
        params: {
          query: "맛집",
          page: 2,
          size: 15,
          category_group_code: "FD6",
          x: center.lng,
          y: center.lat,
          radius: 3000,
        },
      }
    );
    const data = kakaoRespond.data.documents;
    // console.log(data)
    res.status(200).json(data);
  } catch (err) {
    console.error("Kakao API 호출 실패:", err.response?.data || err.message);
  }
});
router.post("/search", async (req, res) => {
  const query = req.body.place;
  const center = req.body.center;
  const categoryCode = ["FD6", "CE7"];
  try {

    const requests = categoryCode.map((code) =>
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
          return null;
        })
    );
    const kakaoResponse = await Promise.all(requests);
    const validResponses = kakaoResponse.filter((res) => res !== null);
    const kakaoData = validResponses.flatMap((res) => res.data.documents);
    if (kakaoData.length === 0) {
      console.log("카카오 데이터 없음 반환")
      return res.status(204).json({ message: "검색 결과가 없습니다." });
    }

    const data = await Promise.all(
      kakaoData.map(async (kd) => {
        const summary = await generateKeyAndDesc({
          category: kd.category_name,
          address_name: kd.address_name,
          place_name: kd.place_name,
        });
        return {
          ...kd,
          summary,
        };
      })
    );
    res.status(200).json(data);
  } catch (err) {
    res.status(500).send("카카오 api 호출 실패");
  }
});
router.post("/search/:id", async (req, res) => {
  const location = req.body.headers;
  const lat = location.lat;
  const lng = location.lng;
  // console.log(location)
  // console.log(lat)
  // console.log(lng)
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
          x: lng,
          y: lat,
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

export default router;
