/* global socket Display $ */

var R;

$(document).ready(function(){
    Display.createRoom(function(num_player){
        socket.emit("new_room", num_player);
    });
});