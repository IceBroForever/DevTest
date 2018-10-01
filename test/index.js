const chai = require('chai'),
    should = chai.should(),
    chaiHttp = require('chai-http'),
    server = require('../app');

chai.use(chaiHttp);

let credentials = {
    login: '1234567',
    password: 'password'
};

let accessToken, refreshToken;

describe('/api/auth', () => {

    describe('/register', () => {

        it('answer with login, access and refresh tokens', () => {
            chai.request(server)
                .post('/api/auth/register')
                .send(credentials)
                .end((error, res) => {
                    res.body.should.have.own.property('login', credentials.login);
                    res.body.should.have.own.property('accessToken').that.is.a('string');
                    res.body.should.have.own.property('refreshToken').that.is.a('string');
                })
        })

        it('answer with status 409, if user already exists', () => {
            chai.request(server)
                .post('/api/auth/register')
                .send(credentials)
                .end((error, res) => {
                    res.should.have.status(409);
                    res.body.should.have.own.property('error').that.is.a('string');
                })
        })

        it('answer with status 409, if login is not correct', () => {
            let body = {
                login: '<>,.?',
                password: 'password'
            };

            chai.request(server)
                .post('/api/auth/register')
                .send(body)
                .end((error, res) => {
                    res.should.have.status(409);
                    res.body.should.have.own.property('error').that.is.a('string');
                })
        })
    });

    describe('/login', () => {

        it('aswer with login, access and refresh tokens if user credentials are fine', () => {
            chai.request(server)
            .get('/api/auth/login')
            .auth(credentials.login, credentials.password)
            .end((error, res) => {
                res.body.should.have.own.property('login', credentials.login);
                res.body.should.have.own.property('accessToken').that.is.a('string');
                res.body.should.have.own.property('refreshToken').that.is.a('string');
                refreshToken = res.body.refreshToken;
            })
        })

        it('aswer with 401 and error "No such user", if user does not exist', () => {
            chai.request(server)
            .get('/api/auth/login')
            .auth('<>?.,', 'password')
            .end((error, res) => {
                res.should.have.status(401);
                res.body.should.have.own.property('error', 'No such user');
            })
        })

        it('aswer with 409 and error "Wrong password", if user send wrond password', () => {
            chai.request(server)
            .get('/api/auth/login')
            .auth(credentials.login, 'pass')
            .end((error, res) => {
                res.should.have.status(409);
                res.body.should.have.own.property('error', 'Wrong password');
            })
        })
    });

    describe('/refreshTokens', () => {

        it('answer with login and new tokens', () => {
            chai.request(server)
            .get('/api/auth/refreshTokens')
            .set('Authorization', 'Bearer ' + refreshToken)
            .end((error, res) => {
                res.should.have.status(200)
                res.body.should.have.own.property('login', credentials.login);
                res.body.should.have.own.property('accessToken').that.is.a('string');
                res.body.should.have.own.property('refreshToken').that.is.a('string');
                accessToken = res.body.accessToken;
                refreshToken = res.body.refreshToken;
            });
        })

        it('answer with status 409 and error, if token is incorrect', () => {
            chai.request(server)
            .get('/api/auth/refreshTokens')
            .set('Authorization', 'Bearer ' + refreshToken + 'b')
            .end((error, res) => {
                res.should.have.status(409);
                res.body.should.have.own.property('error').that.is.a('string');
            }); 
        })
    });
})

describe('/api/posts', () => {
    describe('/send', () => {
        it('send message "OK with status 200, if post sended properly', () => {
            chai.request(server)
            .post('/api/posts/send')
            .set('Authorization', 'Bearer ' + accessToken)
            .send({
                text: 'some text'
            })
            .end((error, res) => {
                res.should.have.status(200);
                res.body.should.have.own.property('message', 'OK');
            });
        })

        it('answer with status 409 and error, if post is longer, than 200', () => {
            let str = '';
            for(let i = 0; i < 250; i++) str += 'a';

            chai.request(server)
            .post('/api/posts/send')
            .set('Authorization', 'Bearer ' + accessToken)
            .send({
                text: str
            })
            .end((error, res) => {
                res.should.have.status(409);
                res.body.should.have.own.property('error').that.is.a('string');
            });
        })
    });

    describe('/', () => {

        it('send array of posts with status 200', () => {
            chai.request(server)
            .get('/api/posts')
            .end((error, res) => {
                res.should.have.status(200);
                for(let post in res.body) {
                    post.should.have.own.property('author').that.is.a('string');
                    post.should.have.own.property('text').that.is.a('string');
                }
            });
        });
    })
});