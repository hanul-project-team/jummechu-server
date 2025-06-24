
import Store from '../../models/Store.js'; // Store 모델 임포트
import mongoose from 'mongoose'; // ObjectId 유효성 검사를 위해 mongoose 임포트

// 모든 가게를 조회하는 함수 (필요하다면 사용)
export const getPlaces = async (req, res) => {
  try {
    const places = await Store.find({});
    res.status(200).json({ success: true, places });
  } catch (error) {
    console.error("Error fetching places:", error);
    res.status(500).json({ success: false, message: "가게 목록을 불러오는 데 실패했습니다." });
  }
};

// ★★★ 특정 ID의 가게 상세 정보를 조회하는 함수 ★★★
export const getPlaceById = async (req, res) => {
  const { id } = req.params;

  // ID 유효성 검사 (MongoDB ObjectId 형식인지 확인)
  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.warn(`Invalid Store ID format: ${id}`);
    return res.status(400).json({ success: false, message: "유효하지 않은 가게 ID 형식입니다." });
  }

  try {
    const place = await Store.findById(id);

    if (!place) {
      console.log(`Place with ID ${id} not found.`);
      return res.status(404).json({ success: false, message: "가게를 찾을 수 없습니다." });
    }

    res.status(200).json({ success: true, place });
  } catch (error) {
    console.error(`Error fetching place with ID ${id}:`, error);
    res.status(500).json({ success: false, message: "가게 정보를 불러오는 데 실패했습니다." });
  }
};
