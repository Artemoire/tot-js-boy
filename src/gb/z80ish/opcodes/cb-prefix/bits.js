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

function BITr8(b, r8) {
    return function (cpu) {
        var f = (~cpu.reg[r8] << (7 - b)) & 0x80;
        f |= (cpu.reg[F] & 0x10); // c flag unaffected
        f |= 0x20; // set h flag
        cpu.reg[F] = f;
        cpu.pc++;
        cpu.cycle += 8;
    }
}

function BITHLPt(b) {
    return function (cpu) {
        var addr = (cpu.reg[H] << 8) | cpu.reg[L];
        var val = cpu.mmu.read(addr);
        var f = (~val << (7 - b)) & 0x80;
        f |= (cpu.reg[F] & 0x10); // c flag unaffected
        f |= 0x20; // set h flag
        cpu.reg[F] = f;
        cpu.pc++;
        cpu.cycle += 16;
    }
}

function SETr8(b, r8) {
    return function (cpu) {
        cpu.reg[r8] |= (1 << b);
        cpu.pc++;
        cpu.cycle += 8;
    }
}

function SETHLPt(b) {
    return function (cpu) {
        var addr = (cpu.reg[H] << 8) | cpu.reg[L];
        var val = cpu.mmu.read(addr);
        val |= (1 << b);
        cpu.mmu.write(addr, val);
        cpu.pc++;
        cpu.cycle += 16;
    }
}

function RESr8(b, r8) {
    return function (cpu) {
        cpu.reg[r8] &= ~(1 << b);
        cpu.pc++;
        cpu.cycle += 8;
    }
}

function RESHLPt(b) {
    return function (cpu) {
        var addr = (cpu.reg[H] << 8) | cpu.reg[L];
        var val = cpu.mmu.read(addr);
        val &= ~(1 << b);
        cpu.mmu.write(addr, val);
        cpu.pc++;
        cpu.cycle += 16;
    }
}

module.exports = {
    BITr8,
    BITHLPt,
    SETr8,
    SETHLPt,
    RESr8,
    RESHLPt
};