/* global socket Display*/

var game_id = window.location.pathname.replace("/play/","");

$(document).ready(function(){
    Display.getName(function(name){
        socket.emit("join_game", game_id, name);
    });
});