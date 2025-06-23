import Store from "../../models/store.js";

const getStoreInfo = async (req, res) => {
  const placeData = req.body;
  if (Array.isArray(placeData)) {
    const normalizedPlaces = placeData.map(normalizePlaceInput);
    try {
      const findStores = await Promise.all(
        normalizedPlaces.map(async (place) => {
          const existStore = await Store.findOne({
            name: place?.name,
            address: place?.address,
          });
          return existStore ? existStore.toObject() : null;
        })
      );
      const filteredStores = findStores.filter(Boolean);
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
      return res.status(200).json(existStore);
    } else {
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
