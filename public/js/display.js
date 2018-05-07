/* global $ */
var Display = new function(){
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
    }
};