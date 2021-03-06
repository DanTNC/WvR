class SkillTree {
    constructor(tree){
        this.nodes = []
        this.parseTree(tree);
    }
    parseTree(tree){
        for(let node of tree.split("\n")){
            if(node == "" || node[0] == "#") continue;
            new SkillNode(node, this);
        }
        this.buildTree();
    }
    buildTree(){
        for(let node of this.nodes){
            if(node && node.parentnode != -1){
                this.nodes[node.parentnode].childrenAdd(node.id);
            }
        }
    }
}

class SkillNode {
    constructor(node, tree){
        this.parseNode(node, tree);
        this.children = [];
    }
    parseNode(node, tree){
        var args = node.replace(/\s/g, "").split(";");
        this.id = args[0];
        this.parentnode = args[1];
        this.team = args[2];
        this.level = args[3];
        this.type = args[4];
        this.des = args[5];
        tree.nodes[this.id] = this;
    }
    childrenAdd(ch){
        this.children.push(ch);
    }
}

class Skill {
    constructor(skill, Set){
        this.parseSkill(skill, Set);
    }
    parseSkill(skill, Set){
        // gets id and args
        Set.skill_set[this.id] = this;
    }
}

var CharacterJs = {
    Character: class Character {
        constructor(name, tree){
            var names = name.split("%");
            this.CHname = names[0];
            this.ENname = names[1];
            this.skilltree = new SkillTree(tree);
        }
    },
    character_set: [],
    skill_set: []
};

var fs = require("fs");
var charSet = fs.readFileSync(__dirname + "/character_set.gd", "utf8");
charSet = charSet.split("$");
charSet.shift();// the first one must be a comment
for(let char of charSet){
    var break_ = char.indexOf("\n");
    CharacterJs.character_set.push(new CharacterJs.Character(char.slice(0, break_), char.slice(break_)));
}
var skillSet = fs.readFileSync(__dirname + "/skill_set.gd", "utf8");
skillSet = skillSet.split("\n");
skillSet.shift();// the first line must be a comment
for(let skill of skillSet){
    if(skill[0] == "#") continue;
    new Skill(skill, CharacterJs);
}

module.exports = CharacterJs;