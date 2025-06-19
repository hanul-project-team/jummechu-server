import Store from "../../models/store.js";

const renewStoreInfo = async (req, res) => {
  const storeId = req.params.id;
  // console.log(storeId)
  if (!storeId || storeId === "undefined") {
    return res.status(400).json({
      msg: "storeId가 존재하지 않습니다.",
    });
  }
  const foundStore = await Store.findOne({ _id: storeId });
  try {
    if (foundStore) {
      return res.status(200).json(foundStore);
    }
  } catch (err) {
    return res.status(500).json({
      msg: "가게정보 없음.",
    });
  }
};

export default renewStoreInfo;
