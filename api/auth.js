const router = require('express').Router(),
    passport = require('passport'),
    createHash = require('../utils/hash'),
    { generateAccessToken, generateRefreshToken, verifyToken } = require('../utils/jwt');

const userDB = require('../db/users');

router.post('/register', async function (req, res, next) {
    let { login, password } = req.body;
    let passwordHash = createHash(password);
    try {
        let user = await userDB.add({
            login,
            passwordHash
        });
        return res.status(200).json({
            login,
            accessToken: await generateAccessToken(user),
            refreshToken: await generateRefreshToken(user)
        });
    } catch (error) {
        return next({
            code: 409,
            error
        });
    }
});

router.get('/login', passport.authenticate('basic', { session: false }),
    async function (req, res, next) {
        try {
            return res.status(200).json({
                login: req.user.login,
                accessToken: await generateAccessToken(req.user),
                refreshToken: await generateRefreshToken(req.user)
            });
        } catch (error) {
            return next({
                code: 500,
                error
            })
        }
    });

router.get('/refreshTokens', passport.authenticate('refresh', { session: false }),
    async function (req, res, next) {
        try {
            return res.status(200).json({
                login: req.user.login,
                accessToken: await generateAccessToken(req.user),
                refreshToken: await generateRefreshToken(req.user)
            });
        } catch (error) {
            return next({
                code: 401,
                error
            });
        }
    });

module.exports = router;