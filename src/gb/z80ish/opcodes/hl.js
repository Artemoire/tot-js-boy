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

function ldR8HLPt(r8) {
    return function(cpu) {
        var addr = (cpu.reg[H] << 8) | cpu.reg[L];
        cpu.reg[r8] = cpu.mmu.read(addr);
        cpu.pc++;
        cpu.cycle += 8;
    }
}

function ldHLPtR8(r8) {
    return function(cpu) {
        var addr = (cpu.reg[H] << 8) | cpu.reg[L];
        cpu.mmu.write(addr, cpu.reg[r8]);
        cpu.pc++;
        cpu.cycle += 8;
    }
}

function ldHLIPtA(cpu) {
        // (HL) = A
        var addr = (cpu.reg[H] << 8) | cpu.reg[L];
        cpu.mmu.write(addr, cpu.reg[A]);
        // HL++
        if (cpu.reg[L]++ == 0xFF) {
            cpu.reg[H]++;
        }
        cpu.cycle += 8;
        cpu.pc++;
    // var c = (cpu.reg[L] += 1) >>> 8;
    // cpu.reg[H] += c;
    // cpu.pc++;
    // cpu.cycle += 8;
}

function ldAHLIPt(cpu) {
    // A = (HL)
    var addr = (cpu.reg[H] << 8) | cpu.reg[L];
    cpu.reg[A] = cpu.mmu.read(addr);
    // HL++
    var c = (cpu.reg[L] += 1) >>> 8;
    cpu.reg[H] += c;
    cpu.pc++;
    cpu.cycle += 8;
}

function ldHLDPtA(cpu) {
    // (HL) = A
    var addr = (cpu.reg[H] << 8) | cpu.reg[L];
    cpu.mmu.write(addr, cpu.reg[A]);
    // HL--
    if (cpu.reg[L] == 0) {
        cpu.reg[H]--;
    }
    cpu.reg[L]--;
    cpu.pc++;
    cpu.cycle += 8;
}

function ldAHLDPt(cpu) {
    // A = (HL)
    var addr = (cpu.reg[H] << 8) | cpu.reg[L];
    cpu.reg[A] = cpu.mmu.read(addr);
    // HL--
    if (cpu.reg[L] == 0) {
        cpu.reg[H]--;
    }
    cpu.reg[L]--;
    cpu.pc++;
    cpu.cycle += 8;
}

function ldHLPtnImm(cpu) {
    var addr = (cpu.reg[H] << 8) | cpu.reg[L];
    cpu.pc++;
    cpu.mmu.write(addr, cpu.mmu.read(cpu.pc++));
    cpu.cycle += 12;
}

function addHLR16(r16) {
    return function(cpu) {
        var c = (cpu.reg[L] += (cpu.reg[r16 + 1] & 0xFF)) >>> 8;
        var h = cpu.reg[H] + (cpu.reg[r16]) + c;
        var f = (((cpu.reg[H] & 0x0F) + ((cpu.reg[r16]) & 0x0F) + c) & 0x10) << 1; // 0b00010000 -> 0b00100000 - move to H flag
        f |= (h > 255) ? 0b00010000 : 0; // c set
        f |= cpu.reg[F] & 0b10000000; // keep z flag
        cpu.reg[F] = f;
        cpu.reg[H] = h;
        cpu.cycle += 8;
        cpu.pc++;    
    }
}

function addHLSP(cpu) {
    var c = (cpu.reg[L] += (cpu.sp & 0xFF)) >>> 8;
    var h = cpu.reg[H] + (cpu.sp >>> 8) + c;
    var f = (((cpu.reg[H] & 0x0F) + ((cpu.sp >>> 8) & 0x0F) + c) & 0x10) << 1; // 0b00010000 -> 0b00100000 - move to H flag
    f |= (h > 255) ? 0b00010000 : 0;
    f |= cpu.reg[F] & 0x80; // keep z flag
    cpu.reg[F] = f;
    cpu.reg[H] = h;
    cpu.cycle += 8;
    cpu.pc++;
}

function incHLPt(cpu) {
    var addr = (cpu.reg[H] << 8 | cpu.reg[L]);
    var val = cpu.mmu.read(addr);

    var f = ((val & 0x0F) == 0x0F) ? 0x20 : 0; // -0H-
    f |= (cpu.reg[F] & 0x10); // ---C
    f |= (val == 0xFF) ? 0x80 : 0; // Z---
    cpu.reg[F] = f;

    cpu.mmu.write(addr, val + 1);
    cpu.pc++;
    cpu.cycle += 12;
}

function decHLPt(cpu) {
    var addr = (cpu.reg[H] << 8 | cpu.reg[L]);
    var val = cpu.mmu.read(addr);

    var f = ((val & 0x0F) == 0x00) ? 0x60 : 0x40; // set h flag, 1 n flag
    f |= (cpu.reg[F] & 0x10); // unmodified c flag
    f |= (val == 1) ? 0x80 : 0; // set z flag
    cpu.reg[F] = f;

    cpu.mmu.write(addr, val - 1);
    cpu.pc++;
    cpu.cycle += 12;
}

module.exports = {
    ldR8HLPt,
    ldHLPtR8,
    ldAHLDPt,
    ldHLDPtA,
    ldHLIPtA,
    ldAHLIPt,
    ldHLPtnImm,
    addHLR16,
    addHLSP,
    incHLPt,
    decHLPt
};