import Store from "../../models/store.js";
import StoreImg from "../../models/storeImg.js";
import generateKeyAndDesc from "../../service/openai_keyword/callOpenai.js";

const saveStore = async (req, res) => {
  const rawPlaces = Array.isArray(req.body) ? req.body : [req.body];

  if (rawPlaces.length === 0) {
    return res.status(400).json({ msg: "등록할 데이터가 없습니다." });
  }
  const places = rawPlaces.map(normalizePlaceInput);

  try {
    const results = await Promise.all(
      places.map(async (placeData) => {
        if (!placeData.name || !placeData.address) {
          console.warn("이름 또는 주소 누락", placeData);
          return null;
        }
        const existStore = await Store.findOne({
          name: placeData?.name,
          address: placeData?.address,
        });

        if (existStore) {
          return existStore.toObject();
        }

        if (!existStore) {
          const newStore = new Store({
            name: placeData?.name,
            address: placeData?.address,
            latitude: placeData.y,
            longitude: placeData.x,
            phone: placeData.phone,
            keywords: placeData?.summary?.keyword || [],
            description: placeData?.summary?.description || "",
            photos: [],
          });
          console.log("2-6 DB 미등록 newStore 생성", newStore.name);

          try {
            await newStore.save();
          } catch (err) {
            if (err.code === 11000) {
              const duplicateStore = await Store.findOne({
                name: placeData?.name,
                address: placeData?.address,
              });
              return duplicateStore.toObject();
            } else {
              throw err;
            }
          }

          try {
            const newSummary = await generateKeyAndDesc({
              category: placeData.category_name,
              address_name: placeData.address,
              place_name: placeData.name,
            });

            let keys = [];
            if (typeof newSummary.keyword === "string") {
              keys = newSummary.keyword
                .split(",")
                .map((ky) => ky.trim())
                .filter(Boolean);
            } else if (Array.isArray(newSummary.keyword)) {
              keys = [newSummary.keyword];
            } else {
              console.warn(
                "예상밖의 keyword 형식",
                newSummary.keyword,
                typeof newSummary.keyword
              );
            }

            const allStoreImgs = await StoreImg.find();
            let matchedImages = [];
            for (const img of allStoreImgs) {
              const isMatch = keys.some((kw) => kw.includes(img.keyword));
              if (isMatch) {
                matchedImages.push(img);
              }
            }
            const updatedData = {
              keywords: newSummary.keyword,
              description: newSummary.description,
              photos:
                matchedImages.length > 0
                  ? [
                      matchedImages[
                        Math.floor(Math.random() * matchedImages.length)
                      ].url,
                    ]
                  : [],
            };

            await Store.findByIdAndUpdate({ _id: newStore._id }, updatedData);
            const updatedStore = await Store.findById({ _id: newStore._id });

            return updatedStore.toObject();
          } catch (err) {
            console.log("진행불가 에러 발생", err);
            return newStore.toObject();
          }
        }
      })
    );

    res.status(201).json(results);
  } catch (err) {
    res.status(500).json({
      msg: "요청 실패 다시 시도해주세요",
    });
  }
};

function normalizePlaceInput(input) {
  return {
    name: input.place_name?.trim() || input.name?.trim() || "",
    address: input.address_name?.trim() || input.address?.trim() || "",
    x: input.x || input.longitude,
    y: input.y || input.latitude,
  };
}
export default saveStore;
