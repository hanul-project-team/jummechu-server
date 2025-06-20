import Store from "../../models/store.js";

const getStoreInfo = async (req, res) => {
  const placeData = req.body;
  // console.log('요청 들어온 장소 정보',placeData);
  if (Array.isArray(placeData)) {
    const normalizedPlaces = placeData.map(normalizePlaceInput);
    try {
      const findStores = await Promise.all(
        normalizedPlaces.map(async (place) => {
          const existStore = await Store.findOne({
            name: place?.name,
            address: place?.address,
          });
          // console.log("1번 반환");
          return existStore ? existStore.toObject() : null;
        })
      );
      const filteredStores = findStores.filter(Boolean);
      // console.log("2번 반환");
      return res.status(200).json(filteredStores);
    } catch (err) {
      console.log("배열 데이터 map 실패", err);
    }
  } else {
    const place = normalizePlaceInput(placeData);
    if (!place.name || !place.address) {
      return res.status(400).json({
        msg: "이름 또는 주소가 없습니다.",
      });
    }
    const existStore = await Store.findOne({
      name: place?.name,
      address: place?.address,
    });
    if (existStore) {
      // console.log("1-1 등록되어있음. 마침");
      // console.log(existStore)
      return res.status(200).json(existStore);
    } else {
      console.log("2 미등록 빈배열 반환");
      return res.json(existStore);
    }
  }
};
function normalizePlaceInput(input) {
  return {
    name: input.place_name?.trim() || input.name?.trim() || "",
    address: input.address_name?.trim() || input.address?.trim() || "",
  };
}

export default getStoreInfo;
