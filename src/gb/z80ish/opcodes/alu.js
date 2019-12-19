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

function incSP(cpu) {
    cpu.sp++;
    cpu.pc++;
    cpu.cycle += 8;
}

function decSP(cpu) {
    cpu.sp--;
    cpu.pc++;
    cpu.cycle += 8;
}

function inc16(r16) {
    return function (cpu) {
        var c = (cpu.reg[r16 + 1] += 1) >>> 8;
        cpu.reg[r16] += c;
        cpu.pc++;
        cpu.cycle += 8;
    }
}

function dec16(r16) {
    return function (cpu) {
        if (cpu.reg[r16 + 1] == 0) {
            cpu.reg[r16]--;
        }
        cpu.reg[r16 + 1]--;
        cpu.pc++;
        cpu.cycle += 8;
    }
}

function inc(r8) {
    return function (cpu) {
        var f = ((cpu.reg[r8] & 0x0F) == 0x0F) ? 0b00100000 : 0; // set h flag, 0 n flag
        f |= (cpu.reg[F] & 0b00010000); // unmodified c flag
        f |= (cpu.reg[r8] == 0xFF) ? 0b10000000 : 0; // set z flag
        cpu.reg[r8]++;
        cpu.reg[F] = f;
        cpu.pc++;
        cpu.cycle += 4;
    }
}

function dec(r8) {
    return function (cpu) {
        var f = ((cpu.reg[r8] & 0x0F) == 0x00) ? 0b01100000 : 0b01000000; // set h flag, 1 n flag
        f |= (cpu.reg[F] & 0b00010000); // unmodified c flag
        f |= (cpu.reg[r8] == 1) ? 0b10000000 : 0; // set z flag
        cpu.reg[r8]--;
        cpu.reg[F] = f;
        cpu.pc++;
        cpu.cycle += 4;
    }
}

function ADDreg(r8) {
    return function (cpu) {
        var f = (((cpu.reg[A] & 0x0F) + (cpu.reg[r8] & 0x0F)) & 0x10) << 1; // halfc
        f |= (cpu.reg[A] += cpu.reg[r8]) > 255 ? 0x10 : 0; // set carry
        f |= (cpu.reg[A] == 0) ? 0x80 : 0;
        cpu.reg[F] = f;
        cpu.pc++;
        cpu.cycle += 4;
    }
}

function ADDHLPt(cpu) {
    var addr = (cpu.reg[H] << 8) | cpu.reg[L];
    var val = cpu.mmu.read(addr);
    var f = (((cpu.reg[A] & 0x0F) + (val & 0x0F)) & 0x10) << 1; // halfc
    f |= (cpu.reg[A] += val) > 255 ? 0x10 : 0; // set carry
    f |= (cpu.reg[A] == 0) ? 0x80 : 0;
    cpu.reg[F] = f;
    cpu.pc++;
    cpu.cycle += 8;
}

function ADDImm(cpu) {
    cpu.pc++;
    var val = cpu.mmu.read(cpu.pc++);
    var f = (((cpu.reg[A] & 0x0F) + (val & 0x0F)) & 0x10) << 1; // halfc
    f |= (cpu.reg[A] += val) > 255 ? 0x10 : 0; // set carry
    f |= (cpu.reg[A] == 0) ? 0x80 : 0;
    cpu.reg[F] = f;
    cpu.cycle += 8;
}

function ADCreg(r8) {
    return function (cpu) {
        var c = (cpu.reg[F] & 0x10) >> 4;
        var f = (((cpu.reg[A] & 0x0F) + (cpu.reg[r8] & 0x0F) + c) & 0x10) << 1; // halfc
        f |= (cpu.reg[A] += (cpu.reg[r8] + c)) > 255 ? 0x10 : 0; // set carry
        f |= (cpu.reg[A] == 0) ? 0x80 : 0;
        cpu.reg[F] = f;
        cpu.pc++;
        cpu.cycle += 4;
    }
}

function ADCHLPt(cpu) {
    var c = (cpu.reg[F] & 0x10) >> 4;
    var addr = (cpu.reg[H] << 8) | cpu.reg[L];
    var val = cpu.mmu.read(addr);
    var f = (((cpu.reg[A] & 0x0F) + (val & 0x0F) + c) & 0x10) << 1; // halfc
    f |= (cpu.reg[A] += (val + c)) > 255 ? 0x10 : 0; // set carry
    f |= (cpu.reg[A] == 0) ? 0x80 : 0;
    cpu.reg[F] = f;
    cpu.pc++;
    cpu.cycle += 8;
}

function ADCImm(cpu) {
    var c = (cpu.reg[F] & 0x10) >> 4;
    cpu.pc++;
    var val = cpu.mmu.read(cpu.pc++);
    var f = (((cpu.reg[A] & 0x0F) + (val & 0x0F) + c) & 0x10) << 1; // halfc
    f |= (cpu.reg[A] += (val + c)) > 255 ? 0x10 : 0; // set carry
    f |= (cpu.reg[A] == 0) ? 0x80 : 0;
    cpu.reg[F] = f;
    cpu.cycle += 8;
}

function SUBreg(r8) {
    return function (cpu) {
        var f = (((cpu.reg[A] & 0x0F) - (cpu.reg[r8] & 0x0F)) & 0x10) << 1; // halfc
        f |= 0x40; // set n
        f |= (cpu.reg[A] -= cpu.reg[r8]) < 0 ? 0x10 : 0; // set carry
        f |= (cpu.reg[A] == 0) ? 0x80 : 0;
        cpu.reg[F] = f;
        cpu.pc++;
        cpu.cycle += 4;
    }
}

function SUBHLPt(cpu) {
    var addr = (cpu.reg[H] << 8) | cpu.reg[L];
    var val = cpu.mmu.read(addr);
    var f = (((cpu.reg[A] & 0x0F) - (val & 0x0F)) & 0x10) << 1; // halfc
    f |= 0x40; // set n
    f |= (cpu.reg[A] -= val) < 0 ? 0x10 : 0; // set carry
    f |= (cpu.reg[A] == 0) ? 0x80 : 0;
    cpu.reg[F] = f;
    cpu.pc++;
    cpu.cycle += 8;
}

function SUBImm(cpu) {
    cpu.pc++;
    var val = cpu.mmu.read(cpu.pc++);
    var f = (((cpu.reg[A] & 0x0F) - (val & 0x0F)) & 0x10) << 1; // halfc
    f |= 0x40; // set n
    f |= (cpu.reg[A] -= val) < 0 ? 0x10 : 0; // set carry
    f |= (cpu.reg[A] == 0) ? 0x80 : 0;
    cpu.reg[F] = f;
    cpu.cycle += 8;
}

function SBCreg(r8) {
    return function (cpu) {
        var c = (cpu.reg[F] & 0x10) >> 4;
        var f = (((cpu.reg[A] & 0x0F) - (cpu.reg[r8] & 0x0F) - c) & 0x10) << 1; // halfc
        f |= 0x40; // set n
        f |= (cpu.reg[A] -= (cpu.reg[r8] + c)) < 0 ? 0x10 : 0; // set carry
        f |= (cpu.reg[A] == 0) ? 0x80 : 0;
        cpu.reg[F] = f;
        cpu.pc++;
        cpu.cycle += 4;
    }
}

function SBCHLPt(cpu) {
    var c = (cpu.reg[F] & 0x10) >> 4;
    var addr = (cpu.reg[H] << 8) | cpu.reg[L];
    var val = cpu.mmu.read(addr);
    var f = (((cpu.reg[A] & 0x0F) - (val & 0x0F) - c) & 0x10) << 1; // halfc
    f |= 0x40; // set n
    f |= (cpu.reg[A] -= (val + c)) < 0 ? 0x10 : 0; // set carry
    f |= (cpu.reg[A] == 0) ? 0x80 : 0;
    cpu.reg[F] = f;
    cpu.pc++;
    cpu.cycle += 8;
}

function SBCImm(cpu) {
    var c = (cpu.reg[F] & 0x10) >> 4;
    cpu.pc++;
    var val = cpu.mmu.read(cpu.pc++);
    var f = (((cpu.reg[A] & 0x0F) - (val & 0x0F) - c) & 0x10) << 1; // halfc
    f |= 0x40; // set n
    f |= (cpu.reg[A] -= (val + c)) < 0 ? 0x10 : 0; // set carry
    f |= (cpu.reg[A] == 0) ? 0x80 : 0;
    cpu.reg[F] = f;
    cpu.cycle += 8;
}

function SUBreg(r8) {
    return function (cpu) {
        var f = (((cpu.reg[A] & 0x0F) - (cpu.reg[r8] & 0x0F)) & 0x10) << 1; // halfc
        f |= 0x40; // set n
        f |= (cpu.reg[A] -= cpu.reg[r8]) < 0 ? 0x10 : 0; // set carry
        f |= (cpu.reg[A] == 0) ? 0x80 : 0;
        cpu.reg[F] = f;
        cpu.pc++;
        cpu.cycle += 4;
    }
}

function ANDreg(r8) {
    return function (cpu) {        
        cpu.reg[A] &= cpu.reg[r8];
        cpu.reg[F] = (cpu.reg[A] == 0) ? 0xA0 : 0x20;
        cpu.pc++;
        cpu.cycle += 4;
    }
}

function ANDHLPt(cpu) {
    var addr = (cpu.reg[H] << 8) | cpu.reg[L];
    var val = cpu.mmu.read(addr);
    cpu.reg[A] &= val;
    cpu.reg[F] = (cpu.reg[A] == 0) ? 0xA0 : 0x20;
    cpu.pc++;
    cpu.cycle += 8;
}

function ANDImm(cpu) {
    cpu.pc++;
    var val = cpu.mmu.read(cpu.pc++);
    cpu.reg[A] &= val;
    cpu.reg[F] = (cpu.reg[A] == 0) ? 0xA0 : 0x20;
    cpu.cycle += 8;
}

function ORreg(r8) {
    return function (cpu) {        
        cpu.reg[A] |= cpu.reg[r8];
        cpu.reg[F] = (cpu.reg[A] == 0) ? 0x80 : 0;
        cpu.pc++;
        cpu.cycle += 4;
    }
}

function ORHLPt(cpu) {
    var addr = (cpu.reg[H] << 8) | cpu.reg[L];
    var val = cpu.mmu.read(addr);
    cpu.reg[A] |= val;
    cpu.reg[F] = (cpu.reg[A] == 0) ? 0x80 : 0;
    cpu.pc++;
    cpu.cycle += 8;
}

function ORImm(cpu) {
    cpu.pc++;
    var val = cpu.mmu.read(cpu.pc++);
    cpu.reg[A] |= val;
    cpu.reg[F] = (cpu.reg[A] == 0) ? 0x80 : 0;
    cpu.cycle += 8;
}

function XORreg(r8) {
    return function (cpu) {        
        cpu.reg[A] ^= cpu.reg[r8];
        cpu.reg[F] = (cpu.reg[A] == 0) ? 0x80 : 0;
        cpu.pc++;
        cpu.cycle += 4;
    }
}

function XORHLPt(cpu) {
    var addr = (cpu.reg[H] << 8) | cpu.reg[L];
    var val = cpu.mmu.read(addr);
    cpu.reg[A] ^= val;
    cpu.reg[F] = (cpu.reg[A] == 0) ? 0x80 : 0;
    cpu.pc++;
    cpu.cycle += 8;
}

function XORImm(cpu) {
    cpu.pc++;
    var val = cpu.mmu.read(cpu.pc++);
    cpu.reg[A] ^= val;
    cpu.reg[F] = (cpu.reg[A] == 0) ? 0x80 : 0;
    cpu.cycle += 8;
}

function CPreg(r8) {
    return function(cpu) {
        var f = (((cpu.reg[A] & 0x0F) - (cpu.reg[r8] & 0x0F)) & 0x10) << 1; // halfc
        f |= 0x40; // set n
        f |= (cpu.reg[A] - cpu.reg[r8]) < 0 ? 0x10 : 0; // set carry
        f |= (cpu.reg[A] - cpu.reg[r8]) == 0 ? 0x80 : 0;
        cpu.reg[F] = f;
        cpu.pc++;
        cpu.cycle += 4;
    }
}

function CPHLPt(cpu) {
    var addr = (cpu.reg[H] << 8) | cpu.reg[L];
    var val = cpu.mmu.read(addr);
    var f = (((cpu.reg[A] & 0x0F) - (val & 0x0F)) & 0x10) << 1; // halfc
    f |= 0x40; // set n
    f |= (cpu.reg[A] - val) < 0 ? 0x10 : 0; // set carry
    f |= (cpu.reg[A] - val) == 0 ? 0x80 : 0;
    cpu.reg[F] = f;
    cpu.pc++;
    cpu.cycle += 8;
}

function CPImm(cpu) {
    cpu.pc++;    
    var val = cpu.mmu.read(cpu.pc++);
    var f = (((cpu.reg[A] & 0x0F) - (val & 0x0F)) & 0x10) << 1; // halfc
    f |= 0x40; // set n
    f |= (cpu.reg[A] - val) < 0 ? 0x10 : 0; // set carry
    f |= (cpu.reg[A] - val) == 0 ? 0x80 : 0;
    cpu.reg[F] = f;
    cpu.cycle += 8;
}

function ADDSPImm(cpu) {
    cpu.pc++;
    var val = cpu.mmu.read(cpu.pc++);
    val = (val > 127) ? (val - 256) : val; // signed
    var f = (((cpu.sp & 0x0F) + (val & 0x0F)) & 0x10) << 1; // halfc
    f |= (((cpu.sp & 0xFF) + (val & 0xFF)) & 0x100) >>> 4; // c
    cpu.reg[F] = f;
    cpu.sp += val;    
    cpu.cycle += 16;
}

module.exports = {
    incSP,
    decSP,
    inc16,
    dec16,
    inc,
    dec,
    ADDreg,
    ADDHLPt,
    ADDImm,
    ADCreg,
    ADCHLPt,
    ADCImm,
    SUBreg,
    SUBHLPt,
    SUBImm,
    SBCreg,
    SBCHLPt,
    SBCImm,
    ANDreg,
    ANDHLPt,
    ANDImm,
    ORreg,
    ORHLPt,
    ORImm,
    XORreg,
    XORHLPt,
    XORImm,
    CPreg,
    CPHLPt,
    CPImm,
    ADDSPImm
};