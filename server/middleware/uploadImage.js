const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');

const storage = new GridFsStorage({
    url: process.env.MONGODB_CONNECTION_STRING + "Courses",
    file: (req, file) => {
        const match = ["image/*"];

        if (match.indexOf(file.mimetype) === -1) {
            return {
                filename: `${Date.now()}-${file.originalname}`,
                bucketName: 'files'
            }
        }
    }
});

const upload = multer({ storage });

module.exports = upload;