var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var helmet = require('helmet');
var app = express();
var http = require('http').Server(app)
var io = require('socket.io')(http);
var uuid = require('uuid/v1');
// packages

var index = require('./routes/index');
var play = require('./routes/play');
// routes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(helmet());

app.use('/', index);
app.use('/play', play);

app.use(express.static(path.resolve(__dirname, 'public')));

var port = process.env.PORT || 8080;

http.listen(port, function () {
    console.log('Example app listening on http://msoe-fad11204.c9users.io:'+port);
});

var Game = require('./util/game');
var Games = {};

io.on("connection", function(socket){
    
    console.log('connected');
    
    // connection initialization
    
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
    
    socket.on('new_room', function(num_player){
        let game_id = uuid();
        Games[game_id] = new Game(num_player);
        socket.emit('room_newed', game_id);
    });
    
    socket.on('join_game', function(game_id, name){
        socket.join(game_id, function(){
            Games[game_id].join_game(socket, name);
        });
    });
    
    // event listeners
  
});

// event emitters

var clientIDs = (io)=>{
    // io.of('/').clients((error, clients)=>{
    //     if(error) throw error;
    //     console.log(clients);
    // });
};

// helpers