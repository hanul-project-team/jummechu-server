import express from "express";
import axios from "axios";
const router = express.Router();
import 'dotenv/config'

router.get("/", (req, res) => {
  res.send('hello World')
  // const lat = req.headers.location.slice(1, -1).split(",")[0].trim();
  // const lng = req.headers.location.slice(1, -1).split(",")[1].trim();
  // try {
  //   const googlePlaces = axios
  //     .get(
  //       `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat}%2C${lng}&radius=500&type=restaurant&key=${process.env.API_KEY}`,
  //       {
  //         withCredentials: true,
  //       }
  //     )
  //     .then((results) => {
  //       res.status(200).json(results.data.results);
  //       // console.log(results.data.results)
  //       // console.log('응답 완료')
  //     })
  //     .catch((err) => {
  //       res.status(500).json({
  //         msg: "place 요청 실패",
  //       });
  //     });
  // } catch (err) {
  //   console.log(err);
  // }
});

export default router;
