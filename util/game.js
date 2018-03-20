class Game {
    constructor(num_player){
        if(num_player < 6 || num_player > 10){
            console.error("num_player out of range");
        }
        this.sockets = [];
        this.players = [];
        this.first_bribe = undefined;
        this.dice = [];
        this.event_cards = [];
        this.round = 0;
    }
    get_Boss(W_R){
        return this.players[W_R? 1: 0];
    }
    play(){
        this.beforeStart();// add players into the game (carrer decided)
        this.chars_stage();// survivors choose character card
    }
    chars_stage(){// survivors choose character card, next->bribe
        
    }
    bribe_stage(){// bosses take turns bribing survivors, next->game
        var first = Math.random() > 0.5;
        this.get_Boss(first).socket.emit("bribe");
        this.first_bribe = first;
    }
    game_stage(){
        
    }
    register_callbacks(socket){
        socket.on("act", function(op, params){
            this.doAct(op, params);
        });
    }
    join_game(socket, name){
        this.register_callbacks(socket);
        this.sockets.push({socket: socket, name: name});
        if(this.sockets.length == this.num_player){
            this.play();
        }
    }
    shuffle_sockets(){
        var sockets = this.sockets;
        var len = sockets.length;
        for(let i in sockets){
            var dest = Math.floor(Math.random() * len);
            sockets[dest] = [sockets[i], sockets[i] = sockets[dest]][0];
        }
    }
    beforeStart(){
        this.shuffle_sockets();
        this.add_player(this.sockets.slice(0, 2), this.sockets.slice(2));
    }
    add_player(Bosses, Players){
        this.players[0] = new R_Virus(Bosses[0].name, Bosses[0].socket);
        this.players[1] = new Dr_White(Bosses[1].name, Bosses[1].socket);
        for(let ply of Players){
            this.players.push(new Survivor(ply.name, ply.socket));
        }
    }
    bribe(boss, sur){
        var survivor = this.players[sur];
        if(survivor.team == ""){
            survivor.team = boss.team;
        }
    }
    doAct(op, params){
        switch(op){
            case "bribe":
                let boss = params[0];
                let survivors = params[1];
                for(let sur of survivors){
                    this.bribe(boss, sur);
                }
                if(this.first_bribe !== undefined){
                    this.get_Boss(!this.first_bribe).socket.emit("bribe");
                    this.first_bribe = undefined;
                }else{
                    this.game_stage();
                }
                break;
            default:
                console.error("illegal operation received", op, params);
        }
    }
}

class Player {
    constructor(name, socket){
        this.name = name;
        this.team = "";
        this.socket = socket;
    }
    win(){
        
    }
    die(){
        
    }
    act(){
        
    }
    roll(){
        
    }
    attack(){
        
    }
    upgrade(){
        
    }
}

class Boss extends Player {
    upgrade(){
        
    }
    buy(){
        
    }
    take(){
        
    }
}

class Dr_White extends Boss {
    constructor(name, socket){
        super(name, socket);
        this.team = "doctor";
    }
}

class R_Virus extends Boss {
    constructor(name, socket){
        super(name, socket);
        this.team = "virus";
    }
}

class Survivor extends Player {
    give(){
        
    }
}

module.exports = Game;