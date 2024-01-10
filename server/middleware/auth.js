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
                return res.status(403).json({ error: err });
            }
            if (instructor.role !== 'instructor') {
                return res.status(403).json({ error: "You are not authorized as an instructor" });
            }
            req.instructor = instructor;
            next();
        });
    } else {
        res.sendStatus(403);
    }
}