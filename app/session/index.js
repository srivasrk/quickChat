'use strict';

const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const config = require('../config');
const db = require('../db');

//Make sure that we were the original creators of the cookie.
if (process.env.NODE_ENV === 'production'){
    //Initialize session with settings for production
    module.exports = session({
        secret: config.sessionSecret,
        resave: false,
        saveUninitialized: false,
        store: new MongoStore({
            mongooseConnection: db.Mongoose.connection
        })
    });
} else {
    //Initialize session with settings for development
    module.exports = session({
        secret: config.sessionSecret,
        resave: false,
        saveUninitialized: true
    });
}