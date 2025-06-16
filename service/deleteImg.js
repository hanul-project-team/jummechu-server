import StoreImg from '../models/storeImg.js';
import Store from '../models/store.js';
import connect from '../config/db.js';

(async () => {
    connect()
  try {
    await StoreImg.deleteMany({})
    console.log(`삭제완료.`);
  } catch (error) {
    console.error("업데이트 중 오류 발생:", error);
  }
})();