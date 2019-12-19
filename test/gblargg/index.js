const fs = require('fs');
const gb = require('../../src/gb');
var config = require('./config.json');

const openROM = (path) => {
    var romFile = fs.readFileSync('roms/' + path);
    const romData = new Uint8Array(romFile.length);
    for (var i = 0; i < romFile.length; i++) {
        romData[i] = romFile[i];
    }
    return romData;
}


function testROM(romPath) {
    const gameboy = gb();
    gameboy.loadROM(openROM(romPath));
    console.log(`Loaded TEST ROM '${romPath}'`);
    var cpu = gameboy.cpu;
    var brk = 0xc48a;
    var breakCnt = 0;
    while (!gameboy.cpu.excpt && !gameboy.cpu.halt) {
        var prevPc = cpu.pc;
        gameboy.step();
        if (prevPc != cpu.pc) {
            breakCnt = 0;
        } else {
            breakCnt++;
        }

        
        const af = ((cpu.reg[0] << 8) | cpu.reg[1]).toString(16);
        const bc = ((cpu.reg[2] << 8) | cpu.reg[3]).toString(16);
        const de = ((cpu.reg[4] << 8) | cpu.reg[5]).toString(16);
        const hl = ((cpu.reg[6] << 8) | cpu.reg[7]).toString(16);
        const sp = cpu.sp.toString(16);
        const pc = cpu.pc.toString(16);
    
        if (cpu.pc == brk) {        
            // console.log('out!');        
        }
    
        var val = gameboy.mmu.read(0xFF02);
        if (val == 0x81) {           
            var ch = String.fromCharCode(cpu.mmu.ram[0xFF01]);
            process.stdout.write(ch);
            gameboy.mmu.write(0xFF02, 0);
        }

        if (breakCnt >= 100) {
            break;
        }
    }
    
    console.log(`Unloading ROM '${romPath}'..`);
}

config.all.forEach(x => {
    testROM(x);
})

// testROM(config.all[9]);