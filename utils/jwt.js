const jwt = require('jsonwebtoken');

async function generateToken(user, secret, expiresIn) {
    return new Promise((resolve, reject) => {
        jwt.sign({
            login: user.login
        },
        secret,
        {
            expiresIn
        },
        (error, token) => {
            if(error) reject(new Error(error.message));
            resolve(token);
        });
    });
}

async function verifyToken(token, secret) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secret, (error, decoded) => {
            if(error) reject(new Error(error.message));
            resolve(decoded);
        });
    });
}

async function generateAccessToken(user) {
    return generateToken(user, process.env.ACCESS_SECRET, '5d');
}

async function generateRefreshToken(user) {
    return generateToken(user, process.env.REFRESH_SECRET, '30d');
}

async function verifyAccessToken(token) {
    return verifyToken(token, process.env.ACCESS_SECRET);
}

async function verifyRefreshToken(token) {
    return verifyToken(token, process.env.REFRESH_SECRET);
}

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken
}