'use strict';

const express = require('express');
const app = express();
const chatCat = require('./app/');
const passport = require('passport');

app.set('port', process.env.PORT || 3000);
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
});
app.use(chatCat.session);
app.use(passport.initialize());
app.use(passport.session());
app.use(require('morgan')('combined', {
    stream: {
        write: message => {
            //write to logs
            chatCat.logger.log('info', message);
        }
    }
}));

app.use('/', chatCat.router);

chatCat.ioServer(app).listen(app.get('port'), () => {
    console.log('ChatCat running on Port: ', app.get('port'));
});