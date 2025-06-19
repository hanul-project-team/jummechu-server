import Store from "../../models/store.js";

const getMatchedStores = async (req, res) => {
  const requestedTags = req.body.results;
  const center = req.body.center;
  // console.log(requestedTags)
  //   console.log(center)
  const lng = center.longitude;
  const lat = center.latitude;
  //   console.log(lat, lng)
  if (
    !Array.isArray(requestedTags) ||
    typeof lng !== "number" ||
    typeof lat !== "number"
  ) {
    return res.status(400).json({
      msg: "잘못된 요청입니다.",
    });
  }
  const allStores = await Store.find();
  const maxDistance = 1000;

  const results = requestedTags.map((tag) => {
    const matchedStores = allStores.filter((store) => {
      const hasKeyword =
        store.keywords &&
        typeof store.keywords[0] === "string" &&
        store.keywords[0]
          .split(",")
          .map((str) => str.trim())
          .some((key) => key.includes(tag));

      if (!hasKeyword) {
        return false;
      }
      //   console.log(store)
      const distance = getDistanceByLatLng(
        lng,
        lat,
        store.longitude,
        store.latitude
      );
      return distance <= maxDistance && distance > 0;
    });
    return {
      tag,
      stores: matchedStores.slice(0, 10),
    };
  });

  if (results) {
    return res.status(200).json(results);
  } else {
    return res.status(500).json({
      msg: "일치하는 가게 정보를 찾을 수 없습니다.",
    });
  }
};

const getDistanceByLatLng = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // 지구 반지름 (미터 단위)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // 거리(m)
};

export default getMatchedStores;
