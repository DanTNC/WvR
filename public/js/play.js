/* global socket Display $ */

var test_join = (num) => {
    for(let i = 0; i < num; i++){
        socket.emit("join_game", infos.game_id, "a");
    }
};

var infos = {
    game_id: window.location.pathname.replace("/play/","")
};

$(document).ready(function(){
    Display.getName(function(name){
        socket.emit("join_game", infos.game_id, name);
    });
});