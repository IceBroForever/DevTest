const jwt = require('jsonwebtoken');

async function generateToken(user, expiresIn) {
    return new Promise((resolve, reject) => {
        jwt.sign({
            login: user.login
        },
        process.env.SECRET,
        {
            expiresIn
        },
        (error, token) => {
            if(error) reject(error);
            resolve(token);
        });
    });
}

async function generateAccessToken(user) {
    return generateToken(user, '5d');
}

async function generateRefreshToken(user) {
    return generateToken(user, '30d');
}

async function verifyToken(token) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.SECRET, (error, decoded) => {
            if(error) reject(error);
            resolve(decoded);
        });
    });
}

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyToken
}