import Store from "../../models/store.js";

const getStoreInfo = async (req, res) => {
  const placeData = req.body;
  const existStore = await Store.findOne({
    name: placeData.place_name,
    address: placeData.address_name,
  });
  if (existStore) {
    return res.status(200).json(existStore)
  } else {
    return res.json([])
  }
};

export default getStoreInfo;
