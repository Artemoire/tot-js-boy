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

function RLCr8(r8) {
    return function (cpu) {
        var c = cpu.reg[r8] >>> 7;
        cpu.reg[r8] = (cpu.reg[r8] << 1) | c;

        cpu.reg[F] = c << 4; //  000C
        cpu.reg[F] |= (cpu.reg[r8] == 0) ? 0x80 : 0; // Z---
        cpu.pc++;
        cpu.cycle += 8;
    }
}

function RLCHLPt(cpu) {
    var addr = (cpu.reg[H] << 8) | cpu.reg[L];
    var val = cpu.mmu.read(addr);

    var c = val >>> 7;
    val = (val << 1) | c;
    cpu.mmu.write(addr, val);

    cpu.reg[F] = c << 4; //  000C
    cpu.reg[F] |= (val == 0) ? 0x80 : 0; // Z---
    cpu.pc++;
    cpu.cycle += 16;
}

function RRCr8(r8) {
    return function (cpu) {
        var c = (cpu.reg[r8] & 1) << 7; // 0->7
        cpu.reg[r8] = (cpu.reg[r8] >>> 1) | c; // 6-0 | 7

        cpu.reg[F] = c >>> 3; //  000C
        cpu.reg[F] |= (cpu.reg[r8] == 0) ? 0x80 : 0; // Z---
        cpu.pc++;
        cpu.cycle += 8;
    }
}

function RRCHLPt(cpu) {
    var addr = (cpu.reg[H] << 8) | cpu.reg[L];
    var val = cpu.mmu.read(addr);

    var c = (val & 1) << 7; // 0->7
    val = (val >>> 1) | c; // 6-0 | 7
    cpu.mmu.write(addr, val);

    cpu.reg[F] = c >>> 3; //  000C
    cpu.reg[F] |= (val == 0) ? 0x80 : 0; // Z---
    cpu.pc++;
    cpu.cycle += 16;
}

function RLr8(r8) {
    return function (cpu) {
        var c = (cpu.reg[F] >>> 4) & 0x1; // C->0
        var f = (cpu.reg[r8] >>> 3) & 0x10; // 7->C
        cpu.reg[r8] = (cpu.reg[r8] << 1) | c; // rotate
        f |= (cpu.reg[r8] == 0) ? 0x80 : 0; // Z---
        cpu.reg[F] = f;
        cpu.pc++;
        cpu.cycle += 8;
    }
}

function RLHLPt(cpu) {
    var addr = (cpu.reg[H] << 8) | cpu.reg[L];
    var val = cpu.mmu.read(addr);

    var c = (cpu.reg[F] >>> 4) & 0x1; // C->0
    var f = (val >>> 3) & 0x10; // 7->C
    val = ((val << 1) & 0xFF) | c; // rotate
    cpu.mmu.write(addr, val);

    f |= (val == 0) ? 0x80 : 0; // Z---
    cpu.reg[F] = f;
    cpu.pc++;
    cpu.cycle += 16;
}

function RRr8(r8) {
    return function (cpu) {
        var c = (cpu.reg[F] & 0x10) << 3; // C->7
        var f = (cpu.reg[r8] << 4) & 0x10; // 0->C
        cpu.reg[r8] = (cpu.reg[r8] >>> 1) | c; // 0-6 | C(7)
        f |= (cpu.reg[r8] == 0) ? 0x80 : 0; // Z---
        cpu.reg[F] = f;
        cpu.pc++;
        cpu.cycle += 8;
    }
}

function RRHLPt(cpu) {
    var addr = (cpu.reg[H] << 8) | cpu.reg[L];
    var val = cpu.mmu.read(addr);

    var c = (cpu.reg[F] & 0x10) << 3; // C->7
    var f = (val << 4) & 0x10; // 0->C
    val = (val >>> 1) | c; // 0-6 | C(7)
    cpu.mmu.write(addr, val);

    f |= (val == 0) ? 0x80 : 0; // Z---
    cpu.reg[F] = f;
    cpu.pc++;
    cpu.cycle += 16;
}

function SLAr8(r8) {
    return function (cpu) {
        var f = (cpu.reg[r8] >>> 3) & 0x10; // 7->C
        cpu.reg[r8] = cpu.reg[r8] << 1;
        f |= (cpu.reg[r8] == 0) ? 0x80 : 0; // Z---
        cpu.reg[F] = f;
        cpu.pc++;
        cpu.cycle += 8;
    }
}

function SLAHLPt(cpu) {
    var addr = (cpu.reg[H] << 8) | cpu.reg[L];
    var val = cpu.mmu.read(addr);

    var f = (val >>> 3) & 0x10; // 7->C
    val = (val << 1) & 0xFF;
    f |= (val == 0) ? 0x80 : 0; // Z---
    cpu.reg[F] = f;
    cpu.mmu.write(addr, val);
    cpu.pc++;
    cpu.cycle += 16;
}

function SRAr8(r8) {
    return function (cpu) {
        var f = (cpu.reg[r8] << 4) & 0x10; // 0->C
        var s = cpu.reg[r8] & 0x80; // 7->7
        cpu.reg[r8] = (cpu.reg[r8] >>> 1) | s; // 7 | 7-1
        f |= (cpu.reg[r8] == 0) ? 0x80 : 0; // Z---
        cpu.reg[F] = f;
        cpu.pc++;
        cpu.cycle += 8;
    }
}

function SRAHLPt(cpu) {
    var addr = (cpu.reg[H] << 8) | cpu.reg[L];
    var val = cpu.mmu.read(addr);

    var f = (val << 4) & 0x10; // 0->C
    var s = val & 0x80; // 7->7
    val = (val >>> 1) | s; // 7 | 7-1
    f |= (val == 0) ? 0x80 : 0; // Z---
    cpu.reg[F] = f;
    cpu.mmu.write(addr, val);
    cpu.pc++;
    cpu.cycle += 16;
}

function SWAPr8(r8) {
    return function (cpu) {
        cpu.reg[r8] = ((cpu.reg[r8] >> 4) | (cpu.reg[r8] << 4)) & 0xFF;
        cpu.reg[F] = (cpu.reg[r8] == 0) ? 0x80 : 0;// Z000
        cpu.pc++;
        cpu.cycle += 8;
    }
}

function SWAPHLPt(cpu) {
    var addr = (cpu.reg[H] << 8) | cpu.reg[L];
    var val = cpu.mmu.read(addr);
    val = ((val >> 4) | (val << 4)) & 0xFF;
    cpu.mmu.write(addr, val);
    cpu.reg[F] = (val == 0) ? 0x80 : 0;// Z000
    cpu.pc++;
    cpu.cycle += 16;
}

function SRLr8(r8) {
    return function (cpu) {
        var f = (cpu.reg[r8] << 4) & 0x10; // 0->C
        cpu.reg[r8] = cpu.reg[r8] >>> 1; // $0 7-1
        f |= (cpu.reg[r8] == 0) ? 0x80 : 0; // Z---
        cpu.reg[F] = f;
        cpu.pc++;
        cpu.cycle += 8;
    }
}

function SRLHLPt(cpu) {
    var addr = (cpu.reg[H] << 8) | cpu.reg[L];
    var val = cpu.mmu.read(addr);

    var f = (val << 4) & 0x10; // 0->C
    val = val >>> 1; // $0 7-1
    f |= (val == 0) ? 0x80 : 0; // Z---
    cpu.reg[F] = f;
    cpu.mmu.write(addr, val);
    cpu.pc++;
    cpu.cycle += 16;
}

module.exports = {
    RLCr8,
    RLCHLPt,
    RRCr8,
    RRCHLPt,
    RLr8,
    RLHLPt,
    RRr8,
    RRHLPt,
    SLAr8,
    SLAHLPt,
    SRAr8,
    SRAHLPt,
    SWAPr8,
    SWAPHLPt,
    SRLr8,
    SRLHLPt
};