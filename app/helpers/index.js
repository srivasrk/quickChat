'use strict';

const router = require('express').Router();
const db = require('../db');
const crypto = require('crypto');

//Iterate through the routes objects and mount the routes
let _registerRoutes = (routes, method) => {
    for (let key in routes) {
        if ((typeof routes[key] === 'object') &&
            (routes[key] != null) &&
            !(routes[key] instanceof Array)){
            _registerRoutes(routes[key], key);
        } else {
            //Register the routes
            if (method === 'get') {
                router.get(key, routes[key]);
            } else if (method === 'post') {
                router.post(key, routes[key]);
            } else {
                router.use(routes[key]);
            }
        }
    }
}

let route = routes => {
    _registerRoutes(routes);
    return router;
}

//Find a single document (record) / user on a key
let findOne = profileID => {
    return db.userModel.findOne({
        'profileID': profileID
    });
}

//Create a new user and returns that instance
let createNewUser = profile => {
    return new Promise((resolve, reject) => {
        let newChatUser = new db.userModel({
            profileId: profile.id,
            fullName: profile.displayName,
            profilePic: profile.photos[0].value || ''
        });

        newChatUser.save(error => {
            if (error){
                reject(error);
            } else {
                resolve(newChatUser);
            }
        });
    });
}

//The ES6 promisified version of findById
let findById = id => {
    return new Promise((resolve, reject) => {
        db.userModel.findById(id, (error, user) => {
            if (error){
                reject(error);
            } else {
                resolve(user);
            }
        });
    });
}


//Check if the user is authenticated and logged in
let isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/');
    }
}

//Find a chatRoom by a given name
let findRoomByName = (allRooms, room) => {
    let findRoom = allRooms.findIndex((element, index, array) => {
        if (element.room === room) {
            return true;
        } else {
            return false;
        }
    });
        return findRoom > -1 ? true : false;

}

//a function that generates a unique room ID
let randomHex = () => {
    return crypto.randomBytes(24).toString('hex');
}

//a function that finds a room with a given ID
let findRoomByID = (allrooms, roomID) => {
    return allrooms.find((element, index, array) => {
        if (element.roomID == roomID) {
            return true;
        } else {
            return false
        }
    });
}

//Add a user to a chat room
let addUserToRoom = (allrooms, data, socket) => {
    //fetch the room object
    let getRoom = findRoomByID(allrooms, data.roomID);
    if (getRoom !== undefined) {
        //get the active user's ID (Object ID as used in session)
        let userID = socket.request.session.passport.user;
        //check to see if this user already exists in the chatRoom
        let checkUser = getRoom.users.findIndex((element, index, array) => {
           if (element.userID === userID) {
               return true;
           } else {
               return false;
           }
        });
        //if the user is already present in the room, remove him first
        if(checkUser > -1){
            getRoom.users.splice(checkUser, 1);
        }

        //Push the user into the room's users array
        getRoom.users.push({
            socketID: socket.id,
            userID,
            user: data.user,
            userPic: data.userPic
        });

        //Join the room channel
        socket.join(data.roomID);

        //Return the updated room object
        return getRoom;
    }
}

let removeUserFromRoom = (allrooms, socket) => {
    for (let room of allrooms) {
        let findUser = room.users.findIndex((element, index, array) => {
            if (element.socketID === socket.id) {
                return true;
            } else {
                return false;
            }
        });

        if (findUser > -1) {
            socket.leave(room.roomID);
            room.users.splice(findUser, 1);
            return room;
        }
    }
}

module.exports = {
    route,
    findOne,
    createNewUser,
    findById,
    isAuthenticated,
    findRoomByName,
    randomHex,
    findRoomByID,
    addUserToRoom,
    removeUserFromRoom
}