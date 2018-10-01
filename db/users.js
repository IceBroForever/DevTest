const dbDriver = require('./driver');
const Schema = dbDriver.Schema;

let userSchema = new Schema({
    login: {
        type: String,
        required: true,
        unique: [true, "User already exists"],
        validate: {
            validator: function(value) {
                return /^[A-Za-z0-9]+$/g.test(value)
            },
            message: props => `${props.value} is not valid`
        }
    },
    passwordHash: {
        type: String,
        required: true
    }
});

userSchema.set('toObject', {
    transform: function (doc, ret, options) {
        delete ret._id;
        return ret;
    }
})

userSchema.statics.findByLogin = function (login) {
    return this.findOne({ login }).exec();
}

const User = dbDriver.model('User', userSchema);

async function add(user) {
    try {
        return (await User.create(user)).toObject();
    } catch (error) {
        throw new Error(error.message);
    }
}

async function get(login){
    let user = await User.findByLogin(login);
    return user === null ? null : user.toObject();
}

module.exports = {
    add,
    get
}