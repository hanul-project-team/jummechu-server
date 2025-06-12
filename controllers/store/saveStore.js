import Store from "../../models/store.js";
import StoreImg from "../../models/storeImg.js";
import generateKeyAndDesc from "../openai_keyword/callOpenai.js";

const saveStore = async (req, res) => {
  const placeData = req.body;
  try {
    const existStore = await Store.findOne({
      name: placeData.place_name,
      address: placeData.address_name,
    });

    if (!existStore) {
      const newStore = new Store({
        name: placeData.place_name,
        address: placeData.address_name,
        latitude: placeData.y,
        longitude: placeData.x,
        phone: placeData.phone,
        keywords: placeData?.summary ? placeData.summary.keyword : [],
        description: placeData?.summary ? placeData.summary.description : "",
        photos: [],
      });
      // await newStore.save();
      console.log(newStore)

      // const summary = placeData.summary;

      // if (summary === undefined || summary === null) {
      //   const newSummary = await generateKeyAndDesc({
      //     category: placeData.category_name,
      //     address_name: placeData.address_name,
      //     place_name: placeData.place_name,
      //   });
      //   const allStoreImgs = await StoreImg.find();
      //   let matchedImages = [];
      //   for (const img of allStoreImgs) {
      //     const isMatch = newSummary.keyword.some((kw) =>
      //       kw.includes(img.keyword)
      //     );
      //     if (isMatch) {
      //       matchedImages.push(img);
      //     }
      //   }
      //   if (matchedImages.length > 0) {
      //     const randomImg =
      //       matchedImages[Math.floor(Math.random() * matchedImages.length)];
      //   }

      //   await Store.findByIdAndUpdate(newStore._id, {
      //     keywords: newSummary.keyword,
      //     description: newSummary.description,
      //   });
      // }
      // res.status(201).json(newStore);
    }
  } catch (err) {
    res.status(500).json({
      msg: "요청 실패 다시 시도해주세요",
    });
  }
};
export default saveStore;
