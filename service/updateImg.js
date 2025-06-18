import Store from "../models/store.js";
import StoreImg from "../models/storeImg.js";
import connect from "../config/db.js";

(async () => {
  try {
    connect();
    const stores = await Store.find();
    if (!stores.photos) {
      const allStoreImgs = await StoreImg.find();
      for (const store of stores) {
        let matchedImages = [];
        for (const img of allStoreImgs) {
          const isMatch = store.keywords.some((kw) => kw.includes(img.keyword));
          if (isMatch) {
            matchedImages.push(img);
          }
        }

        if (matchedImages.length > 0) {
          const randomImg =
            matchedImages[Math.floor(Math.random() * matchedImages.length)];
          store.photos = [randomImg.url];
          await store.save();
          console.log(`Updated store ${store._id} with image ${randomImg.url}`);
        }
      }
      console.log("업데이트 완료.");
    }
  } catch (error) {
    console.error("에러 발생:", error);
  }
})();
