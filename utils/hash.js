const crypto = require('crypto');

module.exports = function (password) {
    let hash = crypto.createHmac('sha512', process.env.SALT || "Some salt");
    hash.update(password);
    return hash.digest('hex');
}