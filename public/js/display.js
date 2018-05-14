/* global $ infos */
var r_option = {
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

var Display = new function(){
    this.roulettes = [];
    this.fatalerror = () => {
        alert("Something's wrong! Please retry");
    };
    this.error = (type) => {
        switch (type) {
            case 'num_player':
                alert("The number should be from 6 to 10");
                break;
        }
    };
    this.getName = (callback) => {
        $("body").html("").append("<label for='name'>your name</label><input name='name' id='name'></input>").append("<button id='submit'>submit</button>");
        $("#submit").click(function(){
            window.open(window.location.href);
            callback($("#name").val());
        });
    };
    this.wait = (forwhat) => {
        $("body").html("waiting for other players to " + forwhat + "...");
    };
    this.char = (chars, callback) => {
        $("body").html("").append("<button data-char=0>" + chars[0].CHname + "</button><button data-char=1>" + chars[1].CHname + "</button>");
        $("button").click(function(){
            var choice = Number($(this).data("char"));
            callback(chars[choice]);
            $("body").html("You have chosen " + chars[choice].CHname);
            infos.character = chars[choice];
        });
    };
    this.bribe = (surs, callback) => {
        $("body").html("");
        for(let suridx in surs){
            $("body").append("<button data-bribe=" + suridx + ">" + surs[suridx].CHname + "</button>");
        }
        var bribed = 0;
        var bribed_surs = [];
        $("button").click(function(){
            var choice = Number($(this).data("bribe"));
            bribed++;
            $(`button[data-bribe=${choice}]`).prop("disabled", true);
            bribed_surs.push(surs[choice].id);
            if(bribed == 2){
                callback(bribed_surs);
            }
        });
    };
    this.message = (mes) => {
        alert(mes);
    };
    this.showInfo = () => {
        var tempInfo = Object.assign({}, infos);
        delete tempInfo.game_id;
        delete tempInfo.play_id;
        var character = tempInfo.character;
        delete tempInfo.character;
        $("body").html("");
        for (let key in tempInfo){
            $("body").append(`${key}: ${tempInfo[key]}`).append("<br/>");
        }
        $("body").append(`character name: ${character.CHname}/${character.ENname}`).append("<br/>");
    };
    this.createRoom = (callback) => {
        $("#area").html("").append("<label for='num'>number of players</label><input name='num' id='num_player'></input><button id='create'>create</button>");
        $("#create").click(function(){
            callback($("#num_player").val());
        });
    };
    this.roulette = (target, imageSet, callback) => {
        r_option.stopCallback = callback;
        let self = this;
        this.initImageSet(target, imageSet, function(){
            if(self.roulettes.includes(target)){
                $(target).roulette('option', r_option).roulette('start');
            }else{
                $(target).roulette(r_option).roulette('start');
                self.roulettes.push(target);
            }
        });
    };
    this.initImageSet = (target, imageSet, callback) => {
        $.getJSON('json/rouletteImg.json', {}, function(json){
            if(json[imageSet]){
                $(target).html("");
                var i = 0;
                for(let img of json[imageSet]){
                    $(target).append("<img src='" + img + "' id='r" + i + "'></img>");
                }
                callback();
            }else{
                console.error("Specified image set doesn't exist!");
                throw true;
            }
        });
    };
    this.rouletteStopWrapper = ($stopElem) => {
        return $($stopElem).attr('id').replace('r', '');
    };
};