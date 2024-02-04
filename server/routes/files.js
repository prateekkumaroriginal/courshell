const express = require('express');
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb')

const router = express.Router()

router.get('/images/:imageId', async (req, res) => {
    const { imageId } = req.params;

    try {
        const bucket = new GridFSBucket(mongoose.connection.db, {
            bucketName: 'images'
        });

        const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(imageId));

        res.set('Content-Type', 'image/jpeg');

        downloadStream.on('error', (error) => {
            console.error('Error fetching image:', error);
            return res.status(404).send('Image not found');
        });

        downloadStream.pipe(res);
    } catch (error) {
        console.error('Error fetching image:', error);
        return res.status(500).send('Internal server error');
    }
});

module.exports = router