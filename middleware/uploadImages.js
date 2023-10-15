const path = require('path');
const multer = require('multer');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const directory = 'public/uploads'
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory)
        }
        cb(null, 'public/uploads')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname))
    }
})
const filter = (req, file, cb) => {
    if (file.mimetype == 'image/png' || file.mimetype == 'image/jpg' || file.mimetype == 'image/jpeg') {
        cb(null, true);
    } else {
        cb(null, false);
        return cb(new Error('Only .jpg .png and .jpeg format allowed'))
    }
}


const upload = multer({
    storage: storage
})

module.exports = upload;