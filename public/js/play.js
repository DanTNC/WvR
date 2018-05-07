/* global socket Display $ */

// var game_id = window.location.pathname.replace("/play/","");
// var my_play_id = undefined;

$(document).ready(function(){
    var infos = {
        game_id: window.location.pathname.replace("/play/","")
    };
    
    Display.getName(function(name){
        socket.emit("join_game", infos.game_id, name);
    });
});