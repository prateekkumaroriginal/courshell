const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");

const storage = new GridFsStorage({
    url: process.env.MONGODB_CONNECTION_STRING + "Courses",
    file: (req, file) => {
        return {
            filename: `${Date.now()}-${file.originalname}`,
            bucketName: 'files',
            // TODO add other fields like courseId, isAttachment, isCoverImg, etc. to bypass Attachment schema and finally remove Attachment schema.
            // metadata: {
            //     courseId: req.params.courseId,
            // }
        }
    }
});

const upload = multer({ storage });

module.exports = upload;