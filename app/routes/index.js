'use strict';

const h = require('../helpers');
const passport = require('passport');
const config = require('../config');

module.exports = () => {
    let routes = {
        'get': {
            '/': (req, res, next) => {
                res.render('login');
            },
            '/rooms': [h.isAuthenticated, (req, res,  next) => {
                res.render('rooms', {
                    user: req.user,
                    host: config.host
                });
            }],
            '/chat/:id': [h.isAuthenticated, (req, res, next) => {
                //Find a chatRoom with the given ID
                //Render it if the id is valid
                let getRoom = h.findRoomByID(req.app.locals.chatrooms, req.params.id);
                if (getRoom === undefined){
                    return next();
                } else {
                    res.render('chatroom', {
                        user: req.user,
                        host: config.host,
                        room: getRoom.room,
                        roomID: getRoom.roomID
                    });
                }
            }],
            '/auth/facebook': passport.authenticate('facebook'),
            '/auth/facebook/callback': passport.authenticate('facebook', {
                //This is the redirect route of the authenticate process succeeds
                successRedirect: '/rooms',
                failureReditect: '/'
            }),
            '/auth/twitter': passport.authenticate('twitter'),
            '/auth/twitter/callback': passport.authenticate('twitter', {
                    //This is the redirect route of the authenticate process succeeds
                    successRedirect: '/rooms',
                    failureReditect: '/'
            }),
            '/logout': (req, res, next) => {
                req.logout();
                res.redirect('/');
            }

        },
        'post': {
        },
        'NA': (req, res, next) => {
                res.status(404).sendFile(process.cwd() + '/views/404.htm');
        }
    }

    return h.route(routes);
}