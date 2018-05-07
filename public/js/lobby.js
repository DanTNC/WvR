/* global socket Display $ */

var Roulette = () => {//example for calling Display.roulette
    Display.roulette("div.roulette", "test", function($stopElem){
        var stop = Display.rouletteStopWrapper($stopElem);
        console.log(stop);
    });
};

$(document).ready(function(){
    Display.createRoom(function(num_player){
        socket.emit("new_room", num_player);
    });
});