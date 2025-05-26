import Store from "../../models/store.js";
import generateKeyAndDesc from "../openai_keyword/callOpenai.js";

const saveStore = async (req, res) => {
  const placeData = req.body;

  if (
    !placeData.address_name ||
    !placeData.place_name ||
    (!placeData.x && !placeData.y)
  ) {
    res.status(500).json({
      msg: "가게 정보를 불러오는데 실패했습니다. 다시 시도해 주세요",
    });
  }

  try {
    const existStore = await Store.findOne({
      name: placeData.place_name,
      address: placeData.address_name,
    });
    if (existStore) {
      res.status(201).json(existStore);
    }

    if (!existStore) {
      const newStore = new Store({
        name: placeData.place_name,
        address: placeData.address_name,
        latitude: placeData.y,
        longitude: placeData.x,
        phone: placeData.phone,
        keywords: placeData?.summary ? placeData.summary.keyword : [],
        description: placeData?.summary ? placeData.summary.description : "",
      });
      await newStore.save();
      res.status(201).json(newStore);
      
      const summary = placeData.summary;

      if (summary === undefined || summary === null) {
        const newSummary = await generateKeyAndDesc({
          category: placeData.category_name,
          address_name: placeData.address_name,
          place_name: placeData.place_name,
        });

        await Store.findByIdAndUpdate(newStore._id, {
          keywords: newSummary.keyword,
          description: newSummary.description
        })
      }
    }
  } catch (err) {
    res.status(500).json({
      msg: "요청 실패 다시 시도해주세요",
    });
  }
};
export default saveStore;
