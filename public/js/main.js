const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

//get username and room from URL with QS-library
const {username , room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
}); 
// console.log(username,room )

const socket = io();

//join chatroom
socket.emit('joinRoom', {username,room});

//get room and users
socket.on('roomUsers', ({room,users}) => {
    outputRoomName(room);
    outputUsers(users);
}); 

//output previous messages from db
socket.on('output-messages', ({data,user}) => {
    console.log(data);
    console.log(user);
    if(data.length !=0){
        data.forEach((message) =>{
            if(message.room == user.room )
            {
                console.log("******************");
                console.log(message.username);
                console.log(user);
                if(message.username === (user.username))
                outputOnRefresh(message,'incoming');
                else
                outputOnRefresh(message,'outgoing');
            }
        });
    }
    chatMessages.scrollTop = chatMessages.scrollHeight;

});

//Message from server
socket.on('message', message=>{
    // console.log(message);
    outputMessage(message,'botmsg');

    //scroll down 
    chatMessages.scrollTop = chatMessages.scrollHeight;
});
//Message from server
socket.on('on-message', message=>{
    // console.log(message);
    outputMessage(message,'outgoing');

    //scroll down 
    chatMessages.scrollTop = chatMessages.scrollHeight;
});
socket.on('in-message', message=>{
    // console.log(message);
    outputMessage(message,'incoming');

    //scroll down 
    chatMessages.scrollTop = chatMessages.scrollHeight;
});
 
chatForm.addEventListener('submit', (e)=>{
    e.preventDefault();

    //get message text
    const msg = e.target.elements.msg.value;

    // outputMessage(msg);

    //emit message to server
    socket.emit('chatMessage' , msg);

    //clear input
    e.target.elements.msg.value='';
    e.target.elements.msg.focus();
});

// //output message to DOM
// function outputMessage(message){
//    const div = document.createElement('div');
//    div.classList.add('message'); 
//    div.innerHTML = `<p class="meta">${message.username}&nbsp&nbsp<span>${message.time}</span></p>
//    <p class="text">
//     ${message.text}
//     </p>`;
//     document.querySelector('.chat-messages').appendChild(div);
// }

//output message to DOM
function outputMessage(message,type){
    const div = document.createElement('div');
    let className = type;
    div.classList.add(className,'message'); 
    div.innerHTML = `<p class="meta">${message.username}&nbsp&nbsp<span>${message.time}</span></p>
    <p class="text">
     ${message.text}
     </p>`;
     document.querySelector('.chat-messages').appendChild(div);
 }

//output previous messages from db
function outputOnRefresh(message,type){

    const div = document.createElement('div');
    let className = type;
    div.classList.add(className,'message'); 
    div.innerHTML = `<p class="meta">${message.username}&nbsp&nbsp<span>${message.time}</span></p>
    <p class="text">
     ${message.msg}
     </p>`;
     document.querySelector('.chat-messages').appendChild(div);
 }

//add room name to dom
function outputRoomName(room) {
    roomName.innerText=room;
}

//add users to dom
function outputUsers(users) {
    userList.innerHTML = `
        ${users.map(user=>`<li>${user.username}</li>`).join('')}`;
}