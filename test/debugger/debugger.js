const commandParserFactory = require('./commands/parser.factory');

const core = require('./core')

const commands = ['help', 'step', 'break', 'eval', 'reset', 'h', 's', 'b', 'e', 'r', 'memDump', 'memLoad'];
const commandFuns = [help, core.step, core.brk, core.cEval, core.reset, help, core.step, core.brk, core.cEval, core.reset, core.memDump, core.memLoad];

var parser = commandParserFactory(commands);

function help() {
    const helpText = `Valid Commands:
help|h - prints this
step|s - steps cpu
break|b ADDR - continues execution until cpu.pc == ADDR
eval|e  CODE - executes code with scope {gb, cpu, ram}
reset|r - reloads rom
memLoad PATH - loads memory dump from path
memDump PATH - saves memory dump to path
exit|x - exits program`;
    console.log(helpText);
}

const readline = require('readline');


var question = function (q) {
    return new Promise((res, rej) => {
        cl.question(q, answer => {
            res(answer);
        })
    });
};

function tryCommand(...args) {
    parser.reset();
    var res = -1;
    for (var i = 0; i < args[0].length; i++) {
        res = parser.test(args[0][i]);
        if (res == -2) break;
    }

    if (res < 0) {
        console.log(`Unknown command ${args[0]}`);
        return;
    }

    commandFuns[res](...args.slice(1));
}

var cl = readline.createInterface(process.stdin, process.stdout);

const run = function () {
    
    (async function main() {        
        var answer = '';
        while (!answer.startsWith('x') && !answer.startsWith('exit')) {
            answer = await question('>> ');
            if (!answer.startsWith('x') && !answer.startsWith('exit')) {
                tryCommand(...answer.split(' '));
            }
        }
        cl.close();
        console.log("=");
        console.log(core.msg.text);
    })();
}

module.exports = run;