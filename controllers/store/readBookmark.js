import User from '../../models/user.js'
import Bookmark from '../../models/bookmark.js'

const readBookmark = async (req, res) => {
    const user = req.params.id
    console.log('북마크 요청 유저:',user)
}

export default readBookmark;