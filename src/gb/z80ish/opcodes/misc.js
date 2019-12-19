const A = 0b000;
const F = 0b001;
const B = 0b010;
const C = 0b011;
const D = 0b100;
const E = 0b101;
const H = 0b110;
const L = 0b111;
const PC = 0b1000;
const SP = 0b1001;

function daa(cpu) {

    // ZNHC
    // 8421
    var setFlagC = 0;
    var correction = 0;
    if (((cpu.reg[F] & 0x20) != 0) || (((cpu.reg[F] & 0x40) == 0) && (cpu.reg[A] & 0x0f) > 0x09)) {
        correction |= 0x06;
    }

    if (((cpu.reg[F] & 0x10) != 0) || (((cpu.reg[F] & 0x40) == 0) && cpu.reg[A] > 0x99)) {
        correction |= 0x60;
        setFlagC = 0x10;
    }

    cpu.reg[A] += ((cpu.reg[F] & 0x40) != 0) ? -correction : correction;

    cpu.reg[F] &= 0x40; // 0N00
    if (cpu.reg[A] == 0) {
        cpu.reg[F] |= 0x80; // Z---
    }
    cpu.reg[F] |= setFlagC; // --0C


    // let correction = 0;

    // let setFlagC = 0;
    // const flagC = (cpu.reg[F] & 0x10) != 0;
    // const flagH = (cpu.reg[F] & 0x20) != 0;
    // const flagN = (cpu.reg[F] & 0x40) != 0;
    // const flagZ = (cpu.reg[F] & 0x80) != 0;
    // if (flagH || (!flagN && (cpu.reg[A] & 0xf) > 9)) {
    //     correction |= 0x6;
    // }

    // if (flagC || (!flagN && cpu.reg[A] > 0x99)) {
    //     correction |= 0x60;
    //     setFlagC = 0x10;
    // }

    // cpu.reg[A] += flagN ? -correction : correction;

    // //   value &= 0xff;

    // const setFlagZ = cpu.reg[A] === 0 ? 0x80 : 0;

    // cpu.reg[F] &= ~(0x20 | 0x80 | 0x10);
    // cpu.reg[F] |= setFlagC | setFlagZ;

    cpu.pc++;
    cpu.cycle += 4;
}

function cpl(cpu) {
    cpu.reg[A] = ~cpu.reg[A];
    cpu.reg[F] |= 0x60; // set N and H flags
    cpu.pc++;
    cpu.cycle += 4;
}

function ccf(cpu) {
    var c = (~cpu.reg[F]) & 0x10;
    cpu.reg[F] &= 0x80;
    cpu.reg[F] |= c;
    cpu.pc++;
    cpu.cycle += 4;
}

function scf(cpu) {
    cpu.reg[F] &= 0x80; // keep zf
    cpu.reg[F] |= 0x10; // set cf
    cpu.pc++;
    cpu.cycle += 4;
}

function nop(cpu) {
    cpu.pc++;
    cpu.cycle += 4;
}

function halt(cpu) {
    cpu.pc++;
    cpu.cycle += 4;
    cpu.halt = true;
}

function stop(cpu) {
    // TODO: Does matter if mmu[pc+1] != 00 ?
    cpu.stop = true;
    cpu.pc += 2;
    cpu.cycle += 4;
}

function di(cpu) {
    cpu.interrupts = false;
    cpu.pc++;
    cpu.cycle += 4;
}

function ei(cpu) {
    cpu.interrupts = true;
    cpu.pc++;
    cpu.cycle += 4;
}

module.exports = {
    daa,
    cpl,
    ccf,
    scf,
    nop,
    halt,
    stop,
    di,
    ei
};