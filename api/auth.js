const router = require('express').Router(),
    passport = require('passport'),
    createHash = require('../utils/hash'),
    { generateAccessToken, generateRefreshToken, verifyToken } = require('../utils/jwt');

const userDB = require('../db/users');

router.post('/register', async function (req, res) {
    let { login, password } = req.body;
    let passwordHash = createHash(password);
    try {
        let user = await userDB.add({
            login,
            passwordHash
        });
        res.status(200).json({
            login,
            accessToken: await generateAccessToken(user),
            refreshToken: await generateRefreshToken(user)
        });
    } catch (error) {
        if (error.message === 'User already exists') res.status(409);
        else res.status(500);
        res.json({
            error: error.message
        });
    }
});

router.post('/login', passport.authenticate('basic', { session: false }), async function (req, res) {
    try {
        res.status(200).json({
            login: req.user.login,
            accessToken: await generateAccessToken(req.user),
            refreshToken: await generateRefreshToken(req.user)
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

router.post('/refreshTokens', async function (req, res) {
    let { refreshToken } = req.body;
    try {
        let user = await verifyToken(refreshToken);
        res.status(200).json({
            login: user.login,
            accessToken: await generateAccessToken(user),
            refreshToken: await generateRefreshToken(user)
        });
    } catch (error) {
        res.status(401).json({
            error: error.message
        });
    }
});

module.exports = router;