const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const mongoose = require('mongoose');
const Msg = require('./models/message');
const formatMessage = require('./utils/messages');
const Users = require('./utils/users');
const {userJoin , getCurrentUser, userLeave, getRoomUsers} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const mongoDB = 'mongodb+srv://pragya_21:Prag_22@cluster0.aq9ng.mongodb.net/chatApp?retryWrites=true&w=majority'

mongoose.connect(process.env.MONGODB_URI || mongoDB, { useNewUrlParser: true , useUnifiedTopology: true} ).then(()=>{
    console.log("connected");
}).catch(err => console.log(err))

//SET STATIC FOLDER
app.use(express.static(path.join(__dirname,'public')));

const botName='Admin';

//run when a client connects
io.on('connection' , socket =>{

    socket.on('joinRoom', ({username, room}) =>{
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

    
    //emit for single client
    // socket.emit('message',formatMessage(botName,'Welcome to Connection'));

    Msg.find().then((result)=>{
        socket.emit('output-messages', {data:result,user:user})
    })

    //emit to all others when a user connects
    //broadcast when a user connects
    socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the chat`)
    );

    //send users and room info 
    io.to(user.room).emit('roomUsers',{
        room: user.room ,
        users: getRoomUsers(user.room)
    });

    });


    //listen for chatMessage
    socket.on('chatMessage', msg =>{
        const user = getCurrentUser(socket.id);
        
        const formatMesg = formatMessage(user.username,msg)
        const message = new Msg({
            msg:msg,
            username:user.username,
            room:user.room,
            time:formatMesg.time
        });
        // message.save().then(()=>{
        //     io.to(user.room).emit('message',formatMessage(user.username, msg));
        // }).catch(err => console.log(err))

        message.save().then(()=>{
            socket.broadcast.to(user.room).emit('on-message',formatMessage(user.username, msg));

            socket.emit('in-message',formatMessage(user.username, msg));

        }).catch(err => console.log(err))
        
    });

    //runs when a client disconnects
    socket.on('disconnect', ()=>{
        const user = userLeave(socket.id);


        // emit to EVERYONE
    if(user){
        io.to(user.room).emit('message' , formatMessage(botName, `${user.username} has left the chat`));
        
        //send users and room info
        io.to(user.room).emit('roomUsers',{
        room:user.room,
        users: getRoomUsers(user.room)
        });

    }
    
    });
});

//setting app to production type on heroku
if(process.env.NODE_ENV === 'production'){
    
}

const PORT =process.env.PORT || 3000;

server.listen(PORT, () => console.log(`server running on port ${PORT}`));