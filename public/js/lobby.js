/* global socket Display $ */

var R;

$(document).ready(function(){
    
    var option = {
        speed : 10,
        duration : 3,
        stopImageNumber : -1,
        startCallback : function() {
            console.log('start');
        },
        slowDownCallback : function() {
            console.log('slowDown');
        },
        stopCallback : function($stopElm) {
            console.log('stop', $($stopElm).attr("id").replace('r',''));
        }
    };
    
    R = $('div.roulette').roulette(option);
    
    Display.createRoom(function(num_player){
        socket.emit("new_room", num_player);
    });
});