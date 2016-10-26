'use strict';

const passport = require('passport');
const config = require('../config');
const h = require('../helpers');
const FacebookStrategy = require('passport-facebook').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const logger = require('../logger');

module.exports = () => {
    passport.serializeUser((user, done) => {
        done(null, user.id);//this is the key assigned by mongoDb for each document, & not the fb user id
    });

    passport.deserializeUser((id, done) => {
        //Find the user which has this id
        h.findById(id)
            .then(user => done(null, user))
            .catch(error => logger.log('error', 'Error when deserializing the user: ' + error));
    })

    let authProcessor = (accessToken, refreshToken, profile, done) => {
        //Find a user profile in the local db using profile profile.id
        //If the user if found, return the user data using the done()
        //if the user is not found, create one in the local db and return
        h.findOne(profile.id)
            .then(result => {
                if (result) {
                    done(null, result);
                } else {
                    //Create a new user and return
                    h.createNewUser(profile)
                        .then(newChatUser => done(null, newChatUser))
                        .catch(error => logger.log('error', 'Error while creating a new user: ' + error));
                }
            });

    }

    passport.use(new FacebookStrategy(config.fb, authProcessor));
    passport.use(new TwitterStrategy(config.twitter, authProcessor));
}