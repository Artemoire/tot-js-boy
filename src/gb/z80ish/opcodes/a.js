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

function rlca(cpu) {
    var c = cpu.reg[A] >>> 7;
    cpu.reg[A] = (cpu.reg[A] << 1) | c;
    cpu.reg[F] = c << 4; // 000C
    cpu.pc++;
    cpu.cycle += 4
}

function rla(cpu) {
    var c = (cpu.reg[F] >>> 4) & 0x1;
    var f = (cpu.reg[A] >>> 3) & 0x10;
    cpu.reg[A] = (cpu.reg[A] << 1) | c;
    cpu.reg[F] = f;
    cpu.pc++;
    cpu.cycle += 4;
}

function rrca(cpu) {
    var c = cpu.reg[A] & 1;
    cpu.reg[A] = (cpu.reg[A] >>> 1) | (c << 7);
    cpu.reg[F] = c << 4; // 000C
    cpu.pc++;
    cpu.cycle += 4;
}

function rra(cpu) {
    var c = (cpu.reg[F] << 3) & 0x80;
    var f = (cpu.reg[A] & 1) << 4; // 000C
    cpu.reg[A] = (cpu.reg[A] >>> 1) | c;
    cpu.reg[F] = f;
    cpu.pc++;
    cpu.cycle += 4;
}

module.exports = {
    rlca,
    rla,
    rrca,
    rra
};