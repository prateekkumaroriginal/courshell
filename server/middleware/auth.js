const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET = process.env.SECRET;

module.exports.authenticateUser = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, SECRET, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            if (user.role !== 'user') {
                return res.sendStatus(403);
            }
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(403);
    }
}

module.exports.authenticateInstructor = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, SECRET, (err, instructor) => {
            if (err) {
                return res.sendStatus(403);
            }
            if (instructor.role !== 'instructor') {
                return res.sendStatus(403);
            }
            req.instructor = instructor;
            next();
        });
    } else {
        res.sendStatus(403);
    }
}