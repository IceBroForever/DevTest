const mongoose = require('mongoose');

let dbURI = process.env.DB_URI;

let options = {
    useNewUrlParser: true
};

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