function commandParser(root) {
    return {
        root: root,
        curr: root,
        reset() {
            this.curr = this.root;
        },
        test(char) {
            charId = this.curr.chars.indexOf(char);

            if (charId == -1) {
                // Current node cant branch return fail
                return -2;
            }

            this.curr = this.curr.children[charId];
            return this.curr.resultId;
        }
    }
}

module.exports = commandParser;