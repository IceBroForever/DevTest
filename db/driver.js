const mongoose = require('mongoose');

let dbURI = process.env.DB_URI;
if ('DB_PORT' in process.env) dbURI += ':' + process.env.DB_PORT;

let options = {
    useNewUrlParser: true
};
options.dbName = process.env.DB_NAME;
if ('DB_USER' in process.env) options.user = process.env.DB_USER;
if ('DB_PASSWORD' in process.env) options.pass = process.env.DB_PASSWORD;

mongoose.connect(dbURI, options);

mongoose.connection.on('connected', function() {
    console.log('Connected to db on ' + dbURI);
});

mongoose.connection.on('error', function(err) {
    console.log('Error during connection to db on ' + dbURI + ' : ' + err);
});

mongoose.connection.on('disconnected', function() {
    console.log('Disconnected from db');
});

process.on('SIGINT', function() {
    mongoose.connection.close(function() {
        console.log('Closed connection to db due to app termination');
        process.exit(0);
    });
});

module.exports = mongoose;