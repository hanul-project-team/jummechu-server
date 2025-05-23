import Store from "../../models/store.js";
import generateKeyAndDesc from "../openai_keyword/callOpenai.js";

const registStore = async (req, res) => {
  const storeData = req.body;
  // console.log(storeData)
  const { address_name, place_name, phone, x, y } = req.body;
  const { description, keyword } = req.body.summary;
  // console.log('소개문:',description)
  // console.log('키워드:',keyword)
  // console.log(address_name, place_name, phone, x, y)
  try {
    const existStore = await Store.findOne({
      name: place_name,
      address: address_name,
    });
    if (!existStore) {
      const newStore = new Store({
        name: place_name,
        address: address_name,
        latitude: y,
        longitude: x,
        phone,
        keywords: keyword,
        description,
      });
      await newStore.save();
      res.status(201).json(newStore)
    }
    
    if (existStore) {
        res.status(201).json(existStore)
    }
  } catch (err) {
    res.status(500).json({
      msg: "요청 실패 다시 시도해주세요",
    });
  }
  // console.log('가게명:', storeName)
  // console.log('가게 주소:', storeAddress)
};
export default registStore;
