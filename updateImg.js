import StoreImg from "./models/storeImg.js";
import connect from './config/db.js'

(async () => {
    connect()
  try {
    const result = await StoreImg.deleteMany({keyword: { $in: ["대구탕"] }})
    // const result = await StoreImg.updateMany(
    //   { keyword: "Sushi" },
    //   { $set: { keyword: "초밥" } } 
    // );
    console.log(`${result.modifiedCount}개의 문서가 업데이트되었습니다.`);
  } catch (error) {
    console.error("업데이트 중 오류 발생:", error);
  }
})();