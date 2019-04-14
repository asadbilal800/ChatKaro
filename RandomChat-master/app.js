var express = require('express');
var app = express();  //acquiring express module.
var server =app.listen(3000,function(){ //making server from express.
    console.log('Listening at 3000')}); // 
var io = require('socket.io')(server,{pingTimeout:300000,pingInterval:300000}); //just acquiring io socket and passing express server and ping time making it longer so no disconnectivity occur.
var room;          //stores room name.
var half_empty =[]  //stores which room are half empty.
var map ={}  //converts id to room name.
var listOf = [] //for some reason.
var path = require('path')
app.use(express.static(path.join(__dirname,'public')));

function assigning(socket) {    //assign socket a new room if no half empty room exist.
    if(half_empty.length==0)
    {      
            var x = Math.random()*1000;
            room=x.toString()
            half_empty.push(room) 
            socket.emit('message', "Connecting");

    }
    else {
        
        var x =half_empty.shift();
        console.log('length:')
        console.log(half_empty.length)
        room =x.toString()
        socket.emit('message', "CONNECTED");

    }
    
socket.join(room)
console.log(room) 
map[socket.client.id]=room
socket.emit('roomtime',room)
socket.in(room).emit('message', "CONNECTED"); 

}

app.get('/', function(req, res) {  //when user asks for localhost.it will give him index.html
    res.sendfile('testing.html');
});

io.on('connection', function(socket) { //when user gets connected,it will run assigning function
    console.log('A user connected');  
    assigning(socket);

    
socket.on('disconnect', function () {
    console.log('user has disconnected')
    var x = map[socket.client.id];
    if(half_empty.includes(x) == false) 
       { half_empty.push(x);  
    }
    else {
        half_empty.pop(x)
    }    });

socket.on('message', function (ex,r) {
       
    socket.in(r).emit('message', ex);

});

socket.on('undefined_state',function(x){  //if the other user has left the room.user 2 will reach undefined_state.
    console.log('UNDEFINED STATE ENTERED..')
    socket.leaveAll();
});


socket.on('findNew', function (room) {

    if(listOf.includes(room) == true){
  
        assigning(socket);  //after reaching undefined state...from that run assigning.
        listOf.pop(room);  
    }
    else {

        listOf.push(room)
        socket.in(room).emit('left',''); //tell the other use that he had left.
        var x = map[socket.client.id];
        socket.leaveAll();    
        assigning(socket); //assign him the new room.
    }
 
  
}); });