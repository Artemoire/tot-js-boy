const commandParser = require('./parser');

function dicnode() {
    return {
        chars: [],
        children: [],
        resultId: -1,
    }
}

function commandFactory(dictionary) {
    var root = dicnode();
    for (var kId = 0; kId < dictionary.length; kId++) {
        const keyword = dictionary[kId];
        var curr = root;
        for (var i = 0; i < keyword.length; i++) {
            var ch = keyword[i];
            var chId = curr.chars.indexOf(ch);
            if (chId == -1) {
                curr.chars.push(ch);
                chId = curr.children.length;
                curr.children.push(dicnode());
            }
            curr = curr.children[chId];
            if (i == keyword.length - 1) {
                curr.resultId = kId;
            }
        }
    }

    return commandParser(root);
}

module.exports = commandFactory;