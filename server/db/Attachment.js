const {Schema, model} = require('mongoose');

const attachmentSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    fileId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    courseId: {
        type: Schema.Types.ObjectId,
        ref: 'Course'
    }
})

const Attachment = new model('Attachment', attachmentSchema);

module.exports = Attachment;