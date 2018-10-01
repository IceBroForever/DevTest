const dbDriver = require('./driver');
const Schema = dbDriver.Schema;

let postSchema = new Schema({
    author: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    text: {
        type: String,
        maxlength: 200
    }
});

postSchema.set('toObject', {
    transform: function (doc, ret, options) {
        delete ret._id;
        return ret;
    }
});

postSchema.statics.findByAuthor = function (author) {
    return this.find({ author }).exec();
}

const Post = dbDriver.model('Post', postSchema);

async function add(post) {
    try{
        return (await Post.create(post)).toObject();
    } catch (error) {
        throw new Error("Text is longer then 200 symbols");
    }
}

async function getAll() {
    let posts = await Post.find().exec();
    return posts.map(post => {
        return post.toObject();
    })
}

async function findByAuthor(author) {
    let posts = Post.findByAuthor(author);
    return posts.map(post => {
        return post.toObject();
    });
}

module.exports = {
    add,
    getAll,
    findByAuthor
};
