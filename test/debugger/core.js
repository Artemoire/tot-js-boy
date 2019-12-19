const gb = require('../../src/gb')();
const fs = require('fs');
const vm = require('vm');

const cpu = gb.cpu;
const instr = 0;

function myStep() {
    gb.step();
    var val = gb.mmu.read(0xFF02);
    if (val == 0x81) {
        var ch = String.fromCharCode(cpu.mmu.ram[0xFF01]);
        msg.text = msg.text + ch;
        gb.mmu.write(0xFF02, 0);
    }
}

const openROM = (path) => {
    var romFile = fs.readFileSync('roms/' + path);
    const romData = new Uint8Array(romFile.length);
    for (var i = 0; i < romFile.length; i++) {
        romData[i] = romFile[i];
    }
    gb.loadROM(romData);
    console.log(`Loaded Rom '${path}'`);
    regs();
    // return romData;
}

function step() {
    myStep();
    regs();
}

function brk(addr) {
    if (typeof addr == 'undefined') {
        console.log('error missing param ADDR');
        return;
    }
    addr = Number.parseInt(addr);
    while (cpu.pc != addr) {
        myStep();
    }
    regs();
}

function regs() {
    function padLeft(str, amt, padChar = '0') {
        amt = amt - str.length;
        for (var i = 0; i < amt; i++) {
            str = padChar + str;
        }

        return str;
    }

    const af = ((cpu.reg[0] << 8) | cpu.reg[1]).toString(16);
    const bc = ((cpu.reg[2] << 8) | cpu.reg[3]).toString(16);
    const de = ((cpu.reg[4] << 8) | cpu.reg[5]).toString(16);
    const hl = ((cpu.reg[6] << 8) | cpu.reg[7]).toString(16);
    const sp = cpu.sp.toString(16);
    const pc = cpu.pc.toString(16);

    const output = `#################
AF ${padLeft(af, 4)}
BC ${padLeft(bc, 4)}
DE ${padLeft(de, 4)}
HL ${padLeft(hl, 4)}
SP ${padLeft(sp, 4)}
PC ${padLeft(pc, 4)} - 0x${padLeft(cpu.mmu.read(cpu.pc).toString(16), 2)}`;
    console.log(output);
}

function whl(cond) {
    while (cond()) {
        myStep();
    }
    regs();
}

function cEval() {
    const fText = [...arguments].join(" ");
    try {
        let result = vm.runInNewContext(fText, { gb: gb, cpu: cpu, mmu: cpu.mmu, ram: cpu.mmu.ram, whl: whl });
        console.log(result);
    } catch (error) {
        console.error(error);
    }
}

function reset() {
    gb.mmu.ram = new Uint8Array(Math.pow(2, 16));
    cpu.reset();
    regs();
}

function memDump(path) {
    if (typeof path == "undefined" || path == "") {
        console.error('memDump - Missing param path');
        return;
    }

    const mem = Buffer.from(cpu.mmu.ram.subarray(0x8000));
    fs.writeFileSync(path, mem);
}

function memLoad(path) {
    if (typeof path == "undefined" || path == "") {
        console.error('memLoad - Missing param path');
        return;
    }
    const mem = fs.readFileSync(path);
    if (mem.length != 32768) {
        console.error('memLoad - memdump wrong size');
        return;
    }
    for (var i = 0; i < mem.length; i++) {
        cpu.mmu.ram[0x8000 + i] = mem[i];
    }
}

var msg = { text: "" }

module.exports = {
    openROM,
    regs,
    step,
    brk,
    cEval,
    reset,
    memDump,
    memLoad,
    msg
}