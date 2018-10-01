const router = require('express').Router(),
    passport = require('passport');

const postsDB = require('../db/posts');

router.get('/', async function (req, res, next) {
    try {
        return res.status(200).json(await postsDB.getAll());
    } catch (error) {
        return next({
            code: 500,
            error
        });
    }
});

router.post('/send',
    passport.authenticate(['basic', 'access'], { session: false }),
    async function (req, res, next) {
        try {
            await postsDB.add({
                author: req.user.login,
                text: req.body.text
            });
            return res.status(200).json({ message: 'OK' });
        } catch (error) {
            return next({
                code: 409,
                error
            });
        }
    }
);

module.exports = router;