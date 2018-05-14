// state consts
const INIT = -1;
const CHAR = 0;
const BRIBE = 1;
const GAME = 2;

// parameter consts
const BOSSES = 2;

var CharacterJs = require("./character.js");

class Core {
    constructor(game, statedict){
        this.game = game;
        this.state = statedict;
        this.core = {
            "char": function(params){
                let play = params[0];
                let char = params[1];
                this.players[play].character = char;
                console.log(`Player ${play} chooses ${char.CHname}`);
            },
            "bribe": function(params){
                let boss = params[0];
                let survivors = params[1];
                for(let sur of survivors){
                    this.bribe(boss, sur);
                }
                if(this.first_bribe !== undefined){
                    this.get_Boss(!this.first_bribe).socket.emit("bribe", (this.first_bribe)? 0: 1, this.get_Survivors());
                    this.players[(this.first_bribe)? 1: 0].socket.emit("wait", "bribe survivors");
                    this.first_bribe = undefined;
                }
                console.log(`Boss ${boss} bribes ${this.players[survivors[0]].character.CHname} and ${this.players[survivors[1]].character.CHname}`);
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
                    valid = boss < 2;
                }
                valid = valid && (survivors < this.num_player || survivors >= 2);
                return valid;
            }
        };
    }
    preAct(op, params){
        if (this.game.state !== this.state[op]) throw true;
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
            console.error(`invalid operation or params received ${op}, ${params}, ${play}`);
            console.error(err.message);
        }
    }
}

var shuffle = (list)=>{// shuffle a list
    var len = list.length;
    for(let i in list){
        var dest = Math.floor(Math.random() * len);
        list[dest] = [list[i], list[i] = list[dest]][0];
    }
}

class Game {
    constructor(num_player, game_id){
        if(num_player < 6 || num_player > 10 || isNaN(num_player)){
            console.error("num_player out of range");
            throw true;
        }
        this.num_player = num_player;
        this.game_id = game_id;
        this.sockets = [];
        this.players = [];
        this.first_bribe = undefined;
        this.core = new Core(this, {
            "char": CHAR,
            "bribe": BRIBE
        });
        this.state = INIT;
        this.dice = [];
        this.event_cards = [];
        this.round = 0;
        this.readyQ = [];
        this.readyN = 0;
        this.next_stage = ()=>{};
        this.characters = CharacterJs.character_set;
        this.bribe_list = [];
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
        var self = this;
        if (this.allready()){
            setTimeout(function() {self.next_stage();});
        }
    }
    stage_start(stage){
        this.state = stage;
        this.next_stage = ()=>{};
    }
    wait_for(stage, cand, excl){// cand: candidate (optional), excl: exclude (optional)
        this.empty_readyQ(cand, excl);
        this.next_stage = stage;
    }
    empty_readyQ(cand, excl){
        var uplimit = cand || this.num_player;
        this.readyN = uplimit;
        var lowlimit = excl || 0;
        for (let i = 0; i < lowlimit; i++){
            this.readyQ[i] = true;
        }
        for (let i = lowlimit; i < uplimit; i++){
            this.readyQ[i] = false;
        }
    }
    get_Boss(W_R){
        return this.players[(W_R? 1: 0)];
    }
    get_Survivors(){
        var survivors = this.players.slice(BOSSES);
        return survivors.map((ele) => {return {"CHname": ele.character.CHname, "id": ele.id}});
    }
    play(){
        this.beforeStart();// add players into the game (career decided)
        this.chars_stage();// survivors choose character card
    }
    get_char_group(){// shuffle the character pool and retrieve <num_player> groups of two character
        shuffle(this.characters);
        var char_group = [];
        for (let i = 0; i < (this.num_player-2)*2; i+=2){
            char_group.push(this.characters.slice(i, i+2));
        }
        return char_group;
    }
    chars_stage(){// survivors choose character card, next->bribe
        this.stage_start(CHAR);
        console.log('Game starts in ', this.game_id, '!! stage: choose character');
        var char_group = this.get_char_group();
        for (let i = 0; i < BOSSES; i++){
            this.players[i].socket.emit("wait", "choose character");
        }
        for (let i = 2; i < this.num_player; i++){
            this.players[i].socket.emit("char", i, char_group[i-2]);
        }
        this.wait_for(this.bribe_stage, undefined, BOSSES);
    }
    bribe_stage(){// bosses take turns bribing survivors, next->game
        this.stage_start(BRIBE);
        for (let i = BOSSES; i < this.num_player; i++){
            this.players[i].socket.emit("wait", "bribe survivors");
        }
        console.log(this.game_id, ' stage: bribing survivors');
        var first = Math.random() > 0.5;
        this.get_Boss(first).socket.emit("bribe", (first? 1: 0), this.get_Survivors());
        this.players[(first? 0: 1)].socket.emit("wait", "bribe survivors");
        this.first_bribe = first;
        this.wait_for(this.game_stage, BOSSES);
    }
    game_stage(){
        this.stage_start(GAME);
        for (let bribe_record of this.bribe_list){
            var survivor = this.players[bribe_record.sur];
            survivor.socket.emit("bribed", bribe_record.boss, bribe_record.team);
        }
        for (let i = 0; i < this.num_player; i++){
            this.players[i].socket.emit("game");
        }
    }
    register_callbacks(socket){
        var self = this;
        socket.on("act", function(op, params, play){
            self.doAct(op, params, play);
        });
    }
    join_game(socket, name){
        if(this.sockets.length >= this.num_player){
            throw true;
        }
        this.register_callbacks(socket);
        console.log(name, 'join room', this.game_id);
        this.sockets.push({socket: socket, name: name});
    }
    check_and_start(){
        if(this.sockets.length == this.num_player){
            this.play();
        }
    }
    beforeStart(){
        shuffle(this.sockets);
        this.add_player(this.sockets.slice(0, 2), this.sockets.slice(2));
    }
    add_player(Bosses, Players){
        this.players[0] = new R_Virus(Bosses[0].name, Bosses[0].socket, 0);
        this.players[1] = new Dr_White(Bosses[1].name, Bosses[1].socket, 1);
        for(let plyidx in Players){
            var ply = Players[plyidx];
            this.players.push(new Survivor(ply.name, ply.socket, Number(plyidx) + 2));
        }
    }
    bribe(boss_, sur){
        var survivor = this.players[sur];
        var boss = this.players[boss_];
        if(survivor.team == ""){
            survivor.team = boss.team;
            this.bribe_list.push({boss:boss.character.CHname, team:boss.team, sur:sur})
        }
    }
    doAct(op, params, play){
        this.core.doAct(op, params, play);
    }
}

class Player {
    constructor(name, socket, id){
        this.name = name;
        this.team = "";
        this.socket = socket;
        this.character = undefined;
        this.id = id;
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
    constructor(name, socket, id){
        super(name, socket, id);
        this.team = "doctor";
        this.character = {CHname: "Dr. White", ENname: "Dr. White"};
    }
}

class R_Virus extends Boss {
    constructor(name, socket, id){
        super(name, socket, id);
        this.team = "virus";
        this.character = {CHname: "R 病毒", ENname: "R virus"};
    }
}

class Survivor extends Player {
    give(){
        
    }
}

module.exports = Game;