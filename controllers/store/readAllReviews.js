import Review from "../../models/review.js";
import Store from '../../models/store.js'
import generateKeyAndDesc from '../openai_keyword/callOpenai.js'

const readReviews = async (req, res) => {
  const places = req.body.places
  // console.log(places)
  const placesCondition = places.map((pl, i) => ({
    name: pl.name,
    address: pl.address
  }))

  try {
    const allStores = await Store.find({$or:placesCondition})
    if(!allStores || allStores.length < 1) {
      return res.status(204).json({
        msg: '일치하는 가게 정보가 존재하지 않습니다.'
      })
    }

    const storeIds = allStores.map(as => as._id)
    if(!storeIds || storeIds.length < 1) {
      return res.status(500).json({
        msg: '아이디를 불러올수 없습니다.'
      })
    }

    const allReviews = await Review.find({store: {$in:storeIds}}).populate('store', 'name address')
    
    res.status(200).json({
      data: {allReviews, allStores}
    });
  } catch (err) {
    console.log(err);
  }
};

export default readReviews;
