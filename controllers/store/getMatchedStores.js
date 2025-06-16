import Store from "../../models/store.js";

const getMatchedStores = async (req, res) => {
  const requestedTags = req.body;
  // console.log(requestedTags)
  if (!requestedTags || !Array.isArray(requestedTags)) {
    return res.status(400).json({
      msg: "잘못된 요청입니다.",
    });
  }
  const foundStores = await Store.find({
    $or: requestedTags.map(tag => ({
        keywords: {$regex: tag, $options: 'i'}
    }))
  })
//   console.log(foundStores)
  if(foundStores.length > 0) {
    return res.status(200).json(foundStores)
  } else {
    return res.status(500).json({
        msg: '일치하는 Store 정보를 찾을 수 없습니다.'
    })
  }
};

export default getMatchedStores;
