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

function jri8(cpu) {
    cpu.pc++;
    var val = cpu.mmu.read(cpu.pc++);
    val = (val > 127) ? (val - 256) : val; // signed
    cpu.pc = (cpu.pc + val) & 0xFFFF; // + % 0xFFFF ?
    cpu.cycle += 12;
}

function jri8nz(cpu) {
    cpu.pc++;
    var val = cpu.mmu.read(cpu.pc++);
    val = (val > 127) ? (val - 256) : val; // signed
    if ((cpu.reg[F] & 0x80) == 0) { // nz
        cpu.pc = (cpu.pc + val) & 0xFFFF; // + % 0xFFFF ?
        cpu.cycle += 12;
        return;
    }
    cpu.cycle += 8;
}

function jri8z(cpu) {
    cpu.pc++;
    var val = cpu.mmu.read(cpu.pc++);
    val = (val > 127) ? (val - 256) : val; // signed
    if ((cpu.reg[F] & 0x80) != 0) { // z

        cpu.pc = (cpu.pc + val) & 0xFFFF; // + % 0xFFFF ?
        cpu.cycle += 12;
        return;
    }
    cpu.cycle += 8;
}

function jri8nc(cpu) {
    cpu.pc++;
    var val = cpu.mmu.read(cpu.pc++);
    val = (val > 127) ? (val - 256) : val; // signed
    if ((cpu.reg[F] & 0x10) == 0) { // nc
        cpu.pc = (cpu.pc + val) & 0xFFFF; // + % 0xFFFF ?
        cpu.cycle += 12;
        return;
    }
    cpu.cycle += 8;
}

function jri8c(cpu) {
    cpu.pc++;
    var val = cpu.mmu.read(cpu.pc++);
    val = (val > 127) ? (val - 256) : val; // signed
    if ((cpu.reg[F] & 0x10) != 0) { // c
        cpu.pc = (cpu.pc + val) & 0xFFFF; // + % 0xFFFF ?
        cpu.cycle += 12;
        return;
    }
    cpu.cycle += 8;
}

function RSTf(f) {
    return function (cpu) {
        cpu.mmu.write(cpu.sp - 1, ((cpu.pc + 1) >>> 8) & 0xFF);
        cpu.mmu.write(cpu.sp - 2, ((cpu.pc + 1)) & 0xFF);
        cpu.pc = f & 0xFF;
        cpu.sp -= 2;
        cpu.cycle += 16;
    }
}

function RET(cpu) {
    cpu.pc = cpu.mmu.read(cpu.sp);
    cpu.pc |= cpu.mmu.read(cpu.sp + 1) << 8;
    cpu.sp += 2;
    cpu.cycle += 16;
}

function RETnz(cpu) {
    if ((cpu.reg[F] & 0x80) == 0) { // nz
        cpu.pc = cpu.mmu.read(cpu.sp);
        cpu.pc |= cpu.mmu.read(cpu.sp + 1) << 8;
        cpu.sp += 2;
        cpu.cycle += 20;

    } else {
        cpu.pc++;
        cpu.cycle += 8;
    }
}

function RETz(cpu) {
    if ((cpu.reg[F] & 0x80) != 0) { // z
        cpu.pc = cpu.mmu.read(cpu.sp);
        cpu.pc |= cpu.mmu.read(cpu.sp + 1) << 8;
        cpu.sp += 2;
        cpu.cycle += 20;

    } else {
        cpu.pc++;
        cpu.cycle += 8;
    }
}

function RETnc(cpu) {
    if ((cpu.reg[F] & 0x10) == 0) { // nc
        cpu.pc = cpu.mmu.read(cpu.sp);
        cpu.pc |= cpu.mmu.read(cpu.sp + 1) << 8;
        cpu.sp += 2;
        cpu.cycle += 20;

    } else {
        cpu.pc++;
        cpu.cycle += 8;
    }
}

function RETc(cpu) {
    if ((cpu.reg[F] & 0x10) != 0) { // c
        cpu.pc = cpu.mmu.read(cpu.sp);
        cpu.pc |= cpu.mmu.read(cpu.sp + 1) << 8;
        cpu.sp += 2;
        cpu.cycle += 20;

    } else {
        cpu.pc++;
        cpu.cycle += 8;
    }
}

function RETi(cpu) {
    cpu.pc = cpu.mmu.read(cpu.sp);
    cpu.pc |= cpu.mmu.read(cpu.sp + 1) << 8;
    cpu.sp += 2;
    cpu.interrupts = true;
    cpu.cycle += 16;
}

function JP(cpu) {
    cpu.pc++;
    var val = cpu.mmu.read(cpu.pc++);
    val |= cpu.mmu.read(cpu.pc++) << 8;
    cpu.pc = val;
    cpu.cycle += 16;
}

function JPnz(cpu) {
    if ((cpu.reg[F] & 0x80) == 0) { // nz
        cpu.pc++;
        var val = cpu.mmu.read(cpu.pc++);
        val |= cpu.mmu.read(cpu.pc++) << 8;
        cpu.pc = val;
        cpu.cycle += 16;
    } else {
        cpu.pc += 3;
        cpu.cycle += 12;
    }
}

function JPz(cpu) {
    if ((cpu.reg[F] & 0x80) != 0) { // z
        cpu.pc++;
        var val = cpu.mmu.read(cpu.pc++);
        val |= cpu.mmu.read(cpu.pc++) << 8;
        cpu.pc = val;
        cpu.cycle += 16;
    } else {
        cpu.pc += 3;
        cpu.cycle += 12;
    }
}

function JPnc(cpu) {
    if ((cpu.reg[F] & 0x10) == 0) { // nc
        cpu.pc++;
        var val = cpu.mmu.read(cpu.pc++);
        val |= cpu.mmu.read(cpu.pc++) << 8;
        cpu.pc = val;
        cpu.cycle += 16;
    } else {
        cpu.pc += 3;
        cpu.cycle += 12;
    }
}

function JPc(cpu) {
    if ((cpu.reg[F] & 0x10) != 0) { // c
        cpu.pc++;
        var val = cpu.mmu.read(cpu.pc++);
        val |= cpu.mmu.read(cpu.pc++) << 8;
        cpu.pc = val;
        cpu.cycle += 16;
    } else {
        cpu.pc += 3;
        cpu.cycle += 12;
    }
}

function JPHL(cpu) {
    cpu.pc = (cpu.reg[H] << 8) | cpu.reg[L];
    cpu.cycle += 4;
}

function CALL(cpu) {
    cpu.mmu.write(cpu.sp - 1, ((cpu.pc + 3) >>> 8) & 0xFF);
    cpu.mmu.write(cpu.sp - 2, (cpu.pc + 3) & 0xFF);
    cpu.pc++;
    var val = cpu.mmu.read(cpu.pc++);
    val |= cpu.mmu.read(cpu.pc++) << 8;
    cpu.pc = val;
    cpu.sp -= 2;
    cpu.cycle += 24;
}

function CALLnz(cpu) {
    if ((cpu.reg[F] & 0x80) == 0) { // nz
        cpu.mmu.write(cpu.sp - 1, ((cpu.pc + 3) >>> 8) & 0xFF);
        cpu.mmu.write(cpu.sp - 2, (cpu.pc + 3) & 0xFF);
        cpu.pc++;
        var val = cpu.mmu.read(cpu.pc++);
        val |= cpu.mmu.read(cpu.pc++) << 8;
        cpu.pc = val;
        cpu.sp -= 2;
    } else {
        cpu.pc += 3;
        cpu.cycle += 12;
    }
}

function CALLz(cpu) {
    if ((cpu.reg[F] & 0x80) != 0) { // z
        cpu.mmu.write(cpu.sp - 1, ((cpu.pc + 3) >>> 8) & 0xFF);
        cpu.mmu.write(cpu.sp - 2, (cpu.pc + 3) & 0xFF);
        cpu.pc++;
        var val = cpu.mmu.read(cpu.pc++);
        val |= cpu.mmu.read(cpu.pc++) << 8;
        cpu.pc = val;
        cpu.sp -= 2;
    } else {
        cpu.pc += 3;
        cpu.cycle += 12;
    }
}

function CALLnc(cpu) {
    if ((cpu.reg[F] & 0x10) == 0) { // nc
        cpu.mmu.write(cpu.sp - 1, ((cpu.pc + 3) >>> 8) & 0xFF);
        cpu.mmu.write(cpu.sp - 2, (cpu.pc + 3) & 0xFF);
        cpu.pc++;
        var val = cpu.mmu.read(cpu.pc++);
        val |= cpu.mmu.read(cpu.pc++) << 8;
        cpu.pc = val;
        cpu.sp -= 2;
    } else {
        cpu.pc += 3;
        cpu.cycle += 12;
    }
}

function CALLc(cpu) {
    if ((cpu.reg[F] & 0x10) != 0) { // c
        cpu.mmu.write(cpu.sp - 1, ((cpu.pc + 3) >>> 8) & 0xFF);
        cpu.mmu.write(cpu.sp - 2, (cpu.pc + 3) & 0xFF);
        cpu.pc++;
        var val = cpu.mmu.read(cpu.pc++);
        val |= cpu.mmu.read(cpu.pc++) << 8;
        cpu.pc = val;
        cpu.sp -= 2;
    } else {
        cpu.pc += 3;
        cpu.cycle += 12;
    }
}

module.exports = {
    jri8,
    jri8nz,
    jri8z,
    jri8nc,
    jri8c,
    RSTf,
    RET,
    RETnz,
    RETz,
    RETnc,
    RETc,
    RETi,
    JP,
    JPnz,
    JPz,
    JPnc,
    JPc,
    JPHL,
    CALL,
    CALLnz,
    CALLz,
    CALLnc,
    CALLc
};