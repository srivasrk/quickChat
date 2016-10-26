'use strict';

const h = require('../helpers');

module.exports = (io, app) => {
    let allrooms = app.locals.chatrooms;

    io.of('/roomslist').on('connection', socket => {
        socket.on('getChatRooms', () => {
            socket.emit('chatRoomsList', JSON.stringify(allrooms));
        });

        socket.on('createNewRoom', newRoomInput => {
            //check to see if a room with the same title exists or not
            //if not, create one and broadcast (list of rooms) it to the users connected

            if (!h.findRoomByName(allrooms, newRoomInput)){
                //Create a new room and broadcast to all
                allrooms.push({
                    room: newRoomInput,
                    roomID:h.randomHex(),
                    users: []
                });

                //Emit an updated list to the creator
                socket.emit('chatRoomsList', JSON.stringify(allrooms));
                //Emit an updated list to everyone connected to the rooms page
                socket.broadcast.emit('chatRoomsList', JSON.stringify(allrooms));
            }
        });
    });

    io.of('/chatter').on('connection', socket => {
        //Join a chatroom
        socket.on('join', data => {
            let usersList = h.addUserToRoom(allrooms, data, socket);

            //Update the list of active users as shown on the chatRoom page
            socket.broadcast.to(data.roomID)
                .emit('updateUsersList', JSON.stringify(usersList.users));
            socket.emit('updateUsersList', JSON.stringify(usersList.users));//back to the user who just joined
        });

        //When a socket exits
        socket.on('disconnect', () => {
            //Find the room to which the socket is connected to and purge the user
            let room = h.removeUserFromRoom(allrooms, socket);
            socket.broadcast.to(room.roomID)
                .emit('updateUsersList', JSON.stringify(room.users));
            //Don't emit it back to the origin, as he is the one who left the room
        });

        //When a new message arrives
        socket.on('newMessage', data => {
            socket.to(data.roomID).emit('inMessage', JSON.stringify(data));
        });
    });
}