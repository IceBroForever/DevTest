require('dotenv').config();

const express = require('express'),
    bodyParser = require('body-parser'),
    busboy = require('busboy-body-parser'),
    passport = require('passport'),
    BasicStrategy = require('passport-http').BasicStrategy,
    BearerStrategy = require('passport-http-bearer').Strategy,
    createHash = require('./utils/hash');

const usersDB = require('./db/users');

const authRouter = require('./api/auth');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(busboy());
app.use(passport.initialize());

passport.use(new BasicStrategy(
    function (login, password, done) {
        usersDB.get(login)
            .then(user => {
                if (user === null) return done('No such user', false);
                if (user.passwordHash !== createHash(password)) return done('Wrong password', false);
                return done(null, user);
            })
            .catch(error => {
                return done(error.message, false);
            });
    }
));

passport.use(new BearerStrategy(
    function (token, done) {

    }
));

app.use('/api/auth', authRouter);

app.listen(process.env.PORT, () => {
    console.log("Server started on port " + process.env.PORT);
});
