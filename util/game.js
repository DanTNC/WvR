// state consts
const INIT = -1;
const CHAR = 0;
const BRIBE = 1;
const GAME = 2;

// parameter consts
const BOSSES = 2;

var CharacterJs = require("./character.js");

class Core {
    constructor(game){
        this.game = game;
        this.core = {
            "char": function(params){
                if (this.state != CHAR) return;
                let play = params[0];
                let char = params[1];
                this.players[play].character = char;
            },
            "bribe": function(params){
                if (this.state != BRIBE) return;
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
            }
        };
        this.core_valid = {
            "char": function(params){
                let play = params[0];
                let char = params[1];
                return play < this.num_player || char instanceof CharacterJs.Character;
            },
            "bribe": function(params){
                let boss = params[0];
                let survivors = params[1];
                var valid;
                if(this.first_bribe !== undefined){
                    valid = boss == this.first_bribe;
                }else{
                    valid = boss < BOSSES;
                }
                valid = valid && (survivors < this.num_player || survivors >= BOSSES);
                return valid;
            }
        };
    }
    preAct(op, params){
        if (!((this.core_valid[op].bind(this.game))(params))){
            throw true;
        }
    }
    postAct(op, params, play){
        this.game.check_and_trigger(play);
    }
    doAct(op, params, play){
        try{
            this.preAct(op, params);
            (this.core[op].bind(this.game))(params);
            this.postAct(op, params, play);
        }catch(err){
            console.error("invalid operation or params received");
        }
    }
}

var shuffle = (list)=>{//shuffle a list
    var len = list.length;
    for(let i in list){
        var dest = Math.floor(Math.random() * len);
        list[dest] = [list[i], list[i] = list[dest]][0];
    }
}

class Game {
    constructor(num_player, game_id){
        if(num_player < 6 || num_player > 10){
            console.error("num_player out of range");
            throw true;
        }
        this.num_player = num_player;
        this.game_id = game_id;
        this.sockets = [];
        this.players = [];
        this.first_bribe = undefined;
        this.core = new Core(this);
        this.state = INIT;
        this.dice = [];
        this.event_cards = [];
        this.round = 0;
        this.readyQ = [];
        this.readyN = 0;
        this.next_stage = ()=>{};
        this.characters = CharacterJs.character_set;
    }
    allready(){
        for (let i = 0; i < this.readyN; i++){
            if(!this.readyQ[i]){
                return false;
            }
        }
        return true;
    }
    check_and_trigger(play){
        this.readyQ[play] = true;
        if (this.allready()){
            this.next_stage();
        }
    }
    stage_start(stage){
        this.state = stage;
        this.next_stage = ()=>{};
    }
    wait_for(stage, cand){// cand: candidate (optional)
        this.empty_readyQ(cand);
        this.next_stage = stage;
    }
    empty_readyQ(cand){
        var limit = cand || this.num_player;
        this.readyN = limit;
        for (let i = 0; i < limit; i++){
            this.readyQ[i] = false;
        }
    }
    get_Boss(W_R){
        return this.players[W_R? 1: 0];
    }
    play(){
        this.beforeStart();// add players into the game (career decided)
        this.chars_stage();// survivors choose character card
    }
    get_char_group(){// shuffle the character pool and retrieve <num_player> groups of two character
        shuffle(this.characters);
        var char_group = [];
        for (let i = 0; i < this.num_player; i+=2){
            char_group.push(this.characters.slice(i, i+2));
        }
        return char_group;
    }
    chars_stage(){// survivors choose character card, next->bribe
        this.stage_start(CHAR);
        console.log('Game starts in ', this.game_id, '!! stage: choose character');
        var char_group = this.get_char_group();
        for (let i = 0; i < this.num_player; i++){
            this.players[i].socket.emit("char", i, char_group[i]);
        }
        this.wait_for(this.bribe_stage, BOSSES);
    }
    bribe_stage(){// bosses take turns bribing survivors, next->game
        this.stage_start(BRIBE);
        console.log(this.game_id, ' stage: bribing survivors');
        var first = Math.random() > 0.5;
        this.get_Boss(first).socket.emit("bribe");
        this.first_bribe = first;
    }
    game_stage(){
        this.stage_start(GAME);
    }
    register_callbacks(socket){
        socket.on("act", function(op, params, play){
            this.doAct(op, params, play);
        });
    }
    join_game(socket, name){
        if(this.sockets.length == this.num_player){
            throw true;
        }
        this.register_callbacks(socket);
        console.log(name, 'join room', this.game_id);
        this.sockets.push({socket: socket, name: name});
        if(this.sockets.length == this.num_player){
            this.play();
        }
    }
    beforeStart(){
        shuffle(this.sockets);
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
    // preAct(op, params){
    //     if (!((this.core_valid[op].bind(this))(params))){
    //         throw true;
    //     }
    // }
    // postAct(op, params, play){
    //     this.check_and_trigger(play);
    // }
    doAct(op, params, play){
        // try{
        //     this.preAct(op, params);
        //     (this.core[op].bind(this))(params);
        //     this.postAct(op, params, play);
        // }catch(err){
        //     console.error("invalid operation or params received");
        // }
        this.core.doAct(op, params, play);
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