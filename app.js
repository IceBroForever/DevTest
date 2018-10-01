require('dotenv').config();

const express = require('express'),
    bodyParser = require('body-parser'),
    busboy = require('busboy-body-parser'),
    passport = require('passport'),
    BasicStrategy = require('passport-http').BasicStrategy,
    BearerStrategy = require('passport-http-bearer').Strategy,
    createHash = require('./utils/hash'),
    { verifyAccessToken, verifyRefreshToken } = require('./utils/jwt');

const usersDB = require('./db/users');

const authRouter = require('./api/auth'),
    postsRouter = require('./api/posts');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(busboy());
app.use(passport.initialize());

passport.use(new BasicStrategy(
    function (login, password, done) {
        usersDB.get(login)
            .then(user => {
                if (user === null) return done({
                    code: 401,
                    error: new Error('No such user')
                }, false);
                if (user.passwordHash !== createHash(password)) return done({
                    code: 409,
                    error: new Error('Wrong password')
                }, false);
                return done(null, user);
            })
            .catch(error => {
                return done(error.message, false);
            });
    }
));

passport.use('access', new BearerStrategy(
    function (token, done) {
        verifyAccessToken(token)
            .then(user => {
                done(null, user);
            })
            .catch(error => {
                done({
                    code: 409,
                    error
                }, false)
            });
    }
));

passport.use('refresh', new BearerStrategy(
    function (token, done) {
        verifyRefreshToken(token)
            .then(user => {
                done(null, user);
            })
            .catch(error => {
                done({
                    code: 409,
                    error
                }, false)
            });
    }
));

app.use('/api/auth', authRouter);
app.use('/api/posts', postsRouter);

app.use(function (errorDesc, req, res, next) {
    let { code, error } = errorDesc;
    return res.status(code).json({ error: error.message });
});

if(require.main === module) {
    app.listen(process.env.PORT, () => {
        console.log("Server started on port " + process.env.PORT);
    });
}

module.exports = app;
