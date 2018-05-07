/* global $ */
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
        $("body").html("").append("<input id='name'></input>").append("<button id='submit'>submit</button>");
        $("#submit").click(function(){
            callback($("#name").val());
        });
    };
    this.wait = () => {
        $("body").html("waiting for other players...");
    };
    this.char = (chars, callback) => {
        //
    };
    this.createRoom = (callback) => {
        $("#area").html("").append("<label for='num'>number of players</label><input name='num' id='num_player'></input><button id='create'>create</button>");
        $("#create").click(function(){
            callback($("#num_player").val());
        });
    };
    this.roulette = (target, imageSet, callback) => {
        r_option.stopCallback = callback;
        this.initImageSet(target, imageSet);
        if(this.roulettes.includes(target)){
            $(target).roulette('option', r_option).roulette('start');
        }else{
            $(target).roulette(r_option).roulette('start');
            this.roulette.append(target);
        }
    };
    this.initImageSet = (target, imageSet) => {
        $.getJSON('json/rouletteImg.json', {}, function(json){
            if(json[imageSet]){
                $(target).html("");
                for(let img of json[imageSet]){
                    $(target).append("<img src='" + img + "'></img>");
                }
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