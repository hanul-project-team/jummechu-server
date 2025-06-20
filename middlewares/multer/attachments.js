import multer from 'multer'
import { fileURLToPath } from 'url'
import path from 'path'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const uploadPath = path.join(__dirname, '../..', 'uploads/attachments')

const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']

const fileFilter = (req, file, cb) => {
    if(allowedTypes.includes(file.mimetype)){
        cb(null, true)
    } else {
        cb(new Error('jpg, jpeg, png 타입의 이미지만 가능합니다.'))
    }
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadPath)
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now()+'-'+Math.round(Math.random()*1E9)
        cb(null, uniqueName+'.'+file.originalname.split('.')[1])
    }
})
// console.log(uploadPath)
const attach = multer({storage, fileFilter})
export default attach;