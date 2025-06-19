import Store from "../../models/store.js";

const getStoreInfo = async (req, res) => {
  const placeData = req.body;
  // console.log('요청 들어온 장소 정보',placeData);
  if (Array.isArray(placeData)) {
    try {
      const findStores = await Promise.all(
        placeData.map(async (place) => {
          const existStore = await Store.findOne({
            name: place.place_name ? place.place_name : place.name,
            address: place.address_name ? place.address_name : place.address,
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
    const existStore = await Store.findOne({
      name: placeData.name ? placeData.name : placeData.place_name,
      address: placeData.address ? placeData.address : placeData.address_name,
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

export default getStoreInfo;
