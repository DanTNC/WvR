/* global io Display infos consts*/

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
    Display.wait("join");
    console.log('game joined');
});

socket.on("hi", function(){//check connection
    console.log("hi");
});

socket.on("wait", function(forwhat){
    Display.wait(forwhat);
});

socket.on("char", function(play_id, chars){
    infos.play_id = play_id;
    console.log(chars);
    Display.char(chars, function(char){
        socket.emit("act", "char", [play_id, char], infos.play_id);
    });
});

socket.on("bribe", function(play_id, surs){
    infos.play_id = play_id;
    if(infos.play_id < 2){// if Boss
        switch(infos.play_id){
            case 0:
                infos.character = consts.Dr_White_char;
                infos.team = "doctor";
                break;
            case 1:
                infos.character = consts.R_Virus_char;
                infos.team = "virus";
                break;
        }
        Display.bribe(surs, function(survivors){
            socket.emit("act", "bribe", [infos.play_id, survivors], infos.play_id);
        });
    }
});

socket.on("bribed", function(boss, team){
    infos.team = team;
    Display.message(`You are bribed by ${boss}. Your team is now ${team}`);
});

socket.on("game", function(){
    Display.showInfo();
});

// event listeners