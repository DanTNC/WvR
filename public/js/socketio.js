/* global io Display*/

var socket = io();
// socket connection

socket.on("bribe", function(){
    Display.bribe(function(boss, survivors){
        socket.emit("act", "bribe", [boss, survivors]);
    });
});
// event listeners

// var register = ()=>{
    // socket.emit("register", socket.id);
// };

// event emitters