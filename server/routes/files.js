const express = require('express');
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb')

const router = express.Router()

router.get('/:fileId', async (req, res) => {
    const { fileId } = req.params;

    try {
        const bucket = new GridFSBucket(mongoose.connection.db, {
            bucketName: 'files'
        });

        const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));

        res.set('Content-Type', 'image/*');

        downloadStream.on('error', (error) => {
            console.error('Error fetching file:', error);
            return res.status(404).send('File not found');
        });

        downloadStream.pipe(res);
    } catch (error) {
        console.error('Error fetching image:', error);
        return res.status(500).send('Internal server error');
    }
});

module.exports = router