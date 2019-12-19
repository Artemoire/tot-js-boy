const z80ish = require('../src/gb/z80ish');
const opcodes = require('../src/gb/z80ish/opcodes');

var fake = new Uint8Array(1);
fake[0] = 0;

const mmu = {
    read: () => { return fake[0]; },
    write: () => { }
}

const cpu = z80ish(mmu);
cpu.reset();

const unks = [0xD3, 0xDB, 0xDD, 0xE3, 0xE4, 0xEB, 0xEC, 0xED, 0xF4, 0xFC, 0xFD];

for(var i = 0; i < 256; i++) {
    if (i == 0xCB) {
        continue;
    }
    if (unks.indexOf(i) != -1) {
        continue;
    }
    cpu.reset();
    var prevCycle = cpu.cycle;
    var prevPC = cpu.pc;
    opcodes[i](cpu);
    if (prevCycle == cpu.cycle || prevPC == cpu.pc) {
        console.warn(`WARNING: 0x${i.toString(16)} doesnt update pc/cycle`);
    }
}

for(var i = 0; i < opcodes.length; i++) {
    if (typeof opcodes[i] == "undefined")
    {
        console.warn(`OPCODE 0x${i.toString(16)} isnt defined`);
        
    }
}

console.log("FINISH");
