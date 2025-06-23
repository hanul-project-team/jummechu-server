import Store from "../../models/store.js";
import StoreImg from "../../models/storeImg.js";
import generateKeyAndDesc from "../../service/openai_keyword/callOpenai.js";

const saveStore = async (req, res) => {
  const rawPlaces = Array.isArray(req.body) ? req.body : [req.body];
  // console.log(rawPlaces);
  // console.log("2-2 등록 과정 실행");

  if (rawPlaces.length === 0) {
    return res.status(400).json({ msg: "등록할 데이터가 없습니다." });
  }
  const places = rawPlaces.map(normalizePlaceInput);

  try {
    const results = await Promise.all(
      places.map(async (placeData) => {
        // console.log("2-3 for of currentStore 생성 = undefined");
        if (!placeData.name || !placeData.address) {
          console.warn("이름 또는 주소 누락", placeData);
          return null;
        }
        const existStore = await Store.findOne({
          name: placeData?.name,
          address: placeData?.address,
        });
        // console.log("2-4 existStore", existStore === null ? "없음" : '잇음');

        if (existStore) {
          return existStore.toObject();
        }
        // console.log("2-5 existStore 배열 등록");

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
            // console.log("2-7 미등록용 newSummary 생성");

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
            // console.log("2-8 이미지 매칭및 데이터 업데이트");

            await Store.findByIdAndUpdate({ _id: newStore._id }, updatedData);
            const updatedStore = await Store.findById({ _id: newStore._id });

            // console.log("2-8-1 업데이트 데이터 반환");
            return updatedStore.toObject();
          } catch (err) {
            console.log("진행불가 에러 발생", err);
            return newStore.toObject();
          }
        }
      })
    );

    // console.log(results);
    // console.log("2-9 등록작업완료");
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
