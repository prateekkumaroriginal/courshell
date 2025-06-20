import jwt from 'jsonwebtoken';
import 'dotenv/config';

const SECRET = process.env.SECRET;

export const authenticateToken = async (req, res, next) => {
    if (req.method === 'OPTIONS') return next();

    console.log("Incoming request to:", req.originalUrl);
    // console.log("Authorization header:", req.headers.authorization);

    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, SECRET, (err, user) => {
            if (err) {
                console.error("JWT verify error:", err);
                return res.status(401).json({ error: 'Invalid token' });
            }
            // console.log("Token verified. User:", user);
            req.user = user;
            next(); // Must call this!
        });
    } else {
        console.error("Missing auth header");
        res.sendStatus(401);
    }
};


export const optionalAuthenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, SECRET, (err, user) => {
            if (!err) {
                req.user = user;
            } else {
                req.user = null;
            }
            next();
        });
    } else {
        req.user = null;
        next();
    }
};

export const authorizeRoles = (...roles) => {
    return async (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        next();
    }
}