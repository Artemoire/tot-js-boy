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

function ldR8nImm(r8) {
    return function(cpu) {
        cpu.pc++;
        cpu.reg[r8] = cpu.mmu.read(cpu.pc++);
        cpu.cycle += 8;
    }
}

function ldR8nR8(r81, r82) {
    return function(cpu) {
        cpu.reg[r81] = cpu.reg[r82]; 
        cpu.pc++;
        cpu.cycle += 4;
    }
}

function ldR16nImm(r16) {
    return function(cpu) {
        cpu.pc++;
        cpu.reg[r16 + 1] = cpu.mmu.read(cpu.pc++);
        cpu.reg[r16] = cpu.mmu.read(cpu.pc++);
        cpu.cycle += 12;
    }
}

function ldARPt(r16) {
    return function(cpu) {
        var addr = (cpu.reg[r16] << 8) | cpu.reg[r16 + 1];
        cpu.reg[A] = cpu.mmu.read(addr);
        cpu.pc++;
        cpu.cycle += 8;
    }
}

function ldRPtA(r16) {
    return function(cpu) {
        var addr = (cpu.reg[r16] << 8) | cpu.reg[r16 + 1];
        cpu.mmu.write(addr, cpu.reg[A]);
        cpu.pc++;
        cpu.cycle += 8;
    }
}

function ldImmPtA(cpu) {
        cpu.pc++;
        var addr = cpu.mmu.read(cpu.pc++);
        addr |= cpu.mmu.read(cpu.pc++) << 8;
        cpu.mmu.write(addr, cpu.reg[A]);
        cpu.cycle += 16;
}

function ldAImmPt(cpu) {
    cpu.pc++;
    var addr = cpu.mmu.read(cpu.pc++);
    addr |= cpu.mmu.read(cpu.pc++) << 8;
    cpu.reg[A] = cpu.mmu.read(addr);
    cpu.cycle += 16;
}

function ldImmPtSP(cpu) {
        cpu.pc++;
        var addr = cpu.mmu.read(cpu.pc++);
        addr |= cpu.mmu.read(cpu.pc++) << 8;
        cpu.mmu.write(addr, cpu.sp&0xFF);
        cpu.mmu.write(addr + 1, (cpu.sp & 0xFF00) >> 8);
        cpu.cycle += 20;
}

function ldSPnImm(cpu) {
    cpu.pc++;
    cpu.sp = cpu.mmu.read(cpu.pc++);
    cpu.sp |= (cpu.mmu.read(cpu.pc++) << 8);
    cpu.cycle += 12;
}

function PUSH(r16) {
    return function(cpu) {
        cpu.mmu.write(cpu.sp - 1, cpu.reg[r16]);
        cpu.mmu.write(cpu.sp - 2, cpu.reg[r16 + 1]);
        cpu.sp -= 2;
        cpu.pc++;
        cpu.cycle += 16;
    }
}

function POP(r16) {
    if (r16 == 0)  {
        return function(cpu) { // if AF lower nibble must be set to 0
            cpu.reg[r16] = cpu.mmu.read(cpu.sp + 1);
            cpu.reg[r16 + 1] = cpu.mmu.read(cpu.sp);
            cpu.reg[r16 + 1] &= 0xF0;
            cpu.sp += 2;
            cpu.pc++;
            cpu.cycle += 12;
        }
    }
    return function(cpu) {
        cpu.reg[r16] = cpu.mmu.read(cpu.sp + 1);
        cpu.reg[r16 + 1] = cpu.mmu.read(cpu.sp);
        cpu.sp += 2;
        cpu.pc++;
        cpu.cycle += 12;
    }
}

function LDFFImmA(cpu) {
    cpu.pc++;
    var val = cpu.mmu.read(cpu.pc++);
    cpu.mmu.write((val + 0xFF00) & 0xFFFF, cpu.reg[A]);
    cpu.cycle += 12;

}

function LDAFFImm(cpu) {
    cpu.pc++;
    var val = cpu.mmu.read(cpu.pc++);
    cpu.reg[A] = cpu.mmu.read((val + 0xFF00) & 0xFFFF);
    cpu.cycle += 12;
}

function LDFFCA(cpu) {
    cpu.mmu.write((cpu.reg[C] + 0xFF00) & 0xFFFF, cpu.reg[A]);
    cpu.pc++;
    cpu.cycle += 8;
}

function LDAFFC(cpu) {
    cpu.reg[A] = cpu.mmu.read((cpu.reg[C] + 0xFF00) & 0xFFFF);
    cpu.pc++;
    cpu.cycle += 8;
}

function LDHLSPi8(cpu) {
    cpu.pc++;
    var val = cpu.mmu.read(cpu.pc++);
    val = (val > 127) ? (val - 256) : val; // signed
    var f = (((cpu.sp & 0x0F) + (val & 0x0F)) & 0x10) << 1; // halfc
    f |= (((cpu.sp & 0xFF) + (val & 0xFF)) & 0x100) >>> 4; // c
    val += cpu.sp;
    cpu.reg[H] = (val >>> 8) & 0xFF;
    cpu.reg[L] = val & 0xFF;
    cpu.reg[F] = f;
    cpu.cycle += 12;
}

function LDSPHL(cpu) {
    cpu.pc++;
    cpu.sp = (cpu.reg[H] << 8) | cpu.reg[L];
    cpu.cycle += 8;    
}

module.exports = {
    ldR8nImm,
    ldR8nR8,
    ldR16nImm,
    ldARPt,
    ldRPtA,
    ldImmPtA,
    ldAImmPt,
    ldImmPtSP,
    ldSPnImm,
    PUSH,
    POP,
    LDFFImmA,
    LDAFFImm,
    LDFFCA,
    LDAFFC,
    LDHLSPi8,
    LDSPHL
}