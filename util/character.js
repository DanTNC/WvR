class SkillTree {
    constructor(tree){
        this.tree = tree;
        this.parseTree(this.tree);
    }
    parseTree(tree){
        //TODO: build skill tree from string representation by tree
    }
}

var CharacterJs = {
    Character: class Character {
        constructor(name, tree){
            this.name = name;
            this.skilltree = new SkillTree(tree);
        }
    },
    character_set: []
};

var charSet = require("./character_set.json");

for (let char of charSet.charSet){
    CharacterJs.character_set.push(new CharacterJs.Character(char.name, char.tree));
}

module.exports = CharacterJs;