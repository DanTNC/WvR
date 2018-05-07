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
    
    socket.emit("hi");
    
    // connection initialization
    
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
    
    socket.on('new_room', function(num_player){
        console.log(num_player);
        let game_id = uuid();
        try{
            Games[game_id] = new Game(num_player, game_id);
            socket.emit('room_newed', game_id);
            console.log('room', game_id, 'has been created');
        }catch(err){
            socket.emit('error_', 'num_player', 'num_player should be in [6, 10]');
        }
    });
    
    socket.on('join_game', function(game_id, name){
        socket.join(game_id, function(){
            if(Games[game_id]){
                try{
                    Games[game_id].join_game(socket, name);
                    socket.emit('joined');
                }catch(err){
                    console.log(err);
                    console.error('room', game_id, 'is already full');
                    socket.emit('fatalerror', 'full room');
                }
            }else{
                console.error('room', game_id, 'doesn\'t exist');
                socket.emit('fatalerror', 'invalid room id');
            }
        });
    });
    
    // event listeners
  
});

// event emitters

// helpers