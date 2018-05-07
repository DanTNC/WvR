/* global io Display infos */

var socket = io();
// socket connection

socket.on("fatalerror", function(msg){
    console.error(msg);
    Display.fatalerror();
});

socket.on("error_", function(type, msg){
    console.error(msg);
    Display.error(type);
});

socket.on("room_newed", function(game_id){
    console.log('enter room', game_id);
    window.location.pathname = `/play/${game_id}`;
});

socket.on("joined", function(){
    Display.wait();
    console.log('game joined');
});

socket.on("hi", function(){//check connection
    console.log("hi");
});

socket.on("char", function(play_id, chars){
    infos.play_id = play_id;
    Display.char(chars, function(char){
        socket.emit("act", "char", [play_id, char], infos.play_id);
    });
});

socket.on("bribe", function(){
    if(infos.play_id < 2){// if Boss
        Display.bribe(function(survivors){
            socket.emit("act", "bribe", [infos.play_id, survivors], infos.play_id);
        });
    }
});

// event listeners