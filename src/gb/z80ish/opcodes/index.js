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

const opcodes = new Array(256);

const {
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
} = require('./alu');
const { daa, cpl, ccf, scf, nop, halt, stop, di, ei } = require('./misc');
const { rlca, rla, rrca, rra } = require('./a');
const {
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
} = require('./loads');
const {
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
} = require('./hl');
const {
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
} = require('./branches');

const cbPrefix = require('./cb-prefix');

function unk(code) {
    return function (cpu) {
        cpu.excpt = true;
        console.log(`undefined instruction ${code}`);
    }
}

function cb(cpu) {
    cpu.pc++;
    const instr = cpu.mmu.read(cpu.pc);
    cbPrefix[instr](cpu);
}

// 0x
opcodes[0x00] = nop;
opcodes[0x01] = ldR16nImm(B); // ld bc, u16
opcodes[0x02] = ldRPtA(B); // ld (bc), a
opcodes[0x03] = inc16(B) // inc bc
opcodes[0x04] = inc(B) // inc b
opcodes[0x05] = dec(B) // dec b
opcodes[0x06] = ldR8nImm(B); // ld b, u8
opcodes[0x07] = rlca; // rlca
opcodes[0x08] = ldImmPtSP; // ld (u16), sp
opcodes[0x09] = addHLR16(B); // add hl, bc
opcodes[0x0A] = ldARPt(B) // ld A, (BC)
opcodes[0x0B] = dec16(B); // dec bc
opcodes[0x0C] = inc(C); // inc c
opcodes[0x0D] = dec(C); // dec c
opcodes[0x0E] = ldR8nImm(C); // ld c, u8
opcodes[0x0F] = rrca; // rrca
// 1x
opcodes[0x10] = stop;
opcodes[0x11] = ldR16nImm(D); // ld de, u16
opcodes[0x12] = ldRPtA(D); // ld (de), A
opcodes[0x13] = inc16(D); // inc de
opcodes[0x14] = inc(D); // inc d
opcodes[0x15] = dec(D); // dec d
opcodes[0x16] = ldR8nImm(D); // ld d, u8
opcodes[0x17] = rla;
opcodes[0x18] = jri8; // jr i8
opcodes[0x19] = addHLR16(D); // add hl, de
opcodes[0x1A] = ldARPt(D); // ld a, (de)
opcodes[0x1B] = dec16(D); // dec de
opcodes[0x1C] = inc(E); // inc e
opcodes[0x1D] = dec(E); // dec e
opcodes[0x1E] = ldR8nImm(E); // ld e, u8
opcodes[0x1F] = rra; // rra
// 2x
opcodes[0x20] = jri8nz; // jr nz, i8
opcodes[0x21] = ldR16nImm(H) // ld hl, u16
opcodes[0x22] = ldHLIPtA; // ld (hl+), a
opcodes[0x23] = inc16(H); // inc hl
opcodes[0x24] = inc(H); // inc h
opcodes[0x25] = dec(H); // dec h
opcodes[0x26] = ldR8nImm(H); // ld h, u8
opcodes[0x27] = daa; // daa
opcodes[0x28] = jri8z; // jr z, i8
opcodes[0x29] = addHLR16(H); // add hl, hl
opcodes[0x2A] = ldAHLIPt; // ld A, (HL+) 
opcodes[0x2B] = dec16(H); // dec hl
opcodes[0x2C] = inc(L); // inc l
opcodes[0x2D] = dec(L); // dec l
opcodes[0x2E] = ldR8nImm(L); // ld l, u8
opcodes[0x2F] = cpl; // cpl
// 3x
opcodes[0x30] = jri8nc; // jr nc, i8
opcodes[0x31] = ldSPnImm; // ld sp, u8
opcodes[0x32] = ldHLDPtA; // ld (hl-), a
opcodes[0x33] = incSP; // inc sp
opcodes[0x34] = incHLPt; // inc (hl)
opcodes[0x35] = decHLPt; // dec (hl)
opcodes[0x36] = ldHLPtnImm; // ld (hl), u8
opcodes[0x37] = scf; // scf
opcodes[0x38] = jri8c; // jr c, i8
opcodes[0x39] = addHLSP; // add hl, sp
opcodes[0x3A] = ldAHLDPt; // ld a, (hl-)
opcodes[0x3B] = decSP; // dec sp
opcodes[0x3C] = inc(A); // inc a
opcodes[0x3D] = dec(A); // dec a
opcodes[0x3E] = ldR8nImm(A); // ld a, u8
opcodes[0x3F] = ccf;
// 4x
opcodes[0x40] = ldR8nR8(B, B); // ld b, b
opcodes[0x41] = ldR8nR8(B, C); // ld b, c
opcodes[0x42] = ldR8nR8(B, D); // ld b, d
opcodes[0x43] = ldR8nR8(B, E); // ld b, e
opcodes[0x44] = ldR8nR8(B, H); // ld b, h
opcodes[0x45] = ldR8nR8(B, L); // ld b, l
opcodes[0x46] = ldR8HLPt(B);   // ld b, (hl)
opcodes[0x47] = ldR8nR8(B, A); // ld b, a
opcodes[0x48] = ldR8nR8(C, B); // ld c, b
opcodes[0x49] = ldR8nR8(C, C); // ld c, c
opcodes[0x4A] = ldR8nR8(C, D); // ld c, d
opcodes[0x4B] = ldR8nR8(C, E); // ld c, e
opcodes[0x4C] = ldR8nR8(C, H); // ld c, h
opcodes[0x4D] = ldR8nR8(C, L); // ld c, l
opcodes[0x4E] = ldR8HLPt(C);   // ld c, (hl)
opcodes[0x4F] = ldR8nR8(C, A); // ld c, a
// 5x
opcodes[0x50] = ldR8nR8(D, B); // ld d, b
opcodes[0x51] = ldR8nR8(D, C); // ld d, c
opcodes[0x52] = ldR8nR8(D, D); // ld d, d
opcodes[0x53] = ldR8nR8(D, E); // ld d, e
opcodes[0x54] = ldR8nR8(D, H); // ld d, h
opcodes[0x55] = ldR8nR8(D, L); // ld d, l
opcodes[0x56] = ldR8HLPt(D);   // ld d, (hl)
opcodes[0x57] = ldR8nR8(D, A); // ld d, a
opcodes[0x58] = ldR8nR8(E, B); // ld e, b
opcodes[0x59] = ldR8nR8(E, C); // ld e, c
opcodes[0x5A] = ldR8nR8(E, D); // ld e, d
opcodes[0x5B] = ldR8nR8(E, E); // ld e, e
opcodes[0x5C] = ldR8nR8(E, H); // ld e, h
opcodes[0x5D] = ldR8nR8(E, L); // ld e, l
opcodes[0x5E] = ldR8HLPt(E);   // ld e, (hl)
opcodes[0x5F] = ldR8nR8(E, A); // ld e, a
// 6x
opcodes[0x60] = ldR8nR8(H, B); // ld h, b
opcodes[0x61] = ldR8nR8(H, C); // ld h, c
opcodes[0x62] = ldR8nR8(H, D); // ld h, d
opcodes[0x63] = ldR8nR8(H, E); // ld h, e
opcodes[0x64] = ldR8nR8(H, H); // ld h, h
opcodes[0x65] = ldR8nR8(H, L); // ld h, l
opcodes[0x66] = ldR8HLPt(H);   // ld h, (hl)
opcodes[0x67] = ldR8nR8(H, A); // ld h, a
opcodes[0x68] = ldR8nR8(L, B); // ld l, b
opcodes[0x69] = ldR8nR8(L, C); // ld l, c
opcodes[0x6A] = ldR8nR8(L, D); // ld l, d
opcodes[0x6B] = ldR8nR8(L, E); // ld l, e
opcodes[0x6C] = ldR8nR8(L, H); // ld l, h
opcodes[0x6D] = ldR8nR8(L, L); // ld l, l
opcodes[0x6E] = ldR8HLPt(L);   // ld l, (hl)
opcodes[0x6F] = ldR8nR8(L, A); // ld l, a
// 7x
opcodes[0x70] = ldHLPtR8(B);   // ld (hl), b
opcodes[0x71] = ldHLPtR8(C);   // ld (hl), c
opcodes[0x72] = ldHLPtR8(D);   // ld (hl), d
opcodes[0x73] = ldHLPtR8(E);   // ld (hl), e
opcodes[0x74] = ldHLPtR8(H);   // ld (hl), h
opcodes[0x75] = ldHLPtR8(L);   // ld (hl), l
opcodes[0x76] = halt;          // halt
opcodes[0x77] = ldHLPtR8(A);   // ld (hl), a
opcodes[0x78] = ldR8nR8(A, B); // ld a, b
opcodes[0x79] = ldR8nR8(A, C); // ld a, c
opcodes[0x7A] = ldR8nR8(A, D); // ld a, d
opcodes[0x7B] = ldR8nR8(A, E); // ld a, e
opcodes[0x7C] = ldR8nR8(A, H); // ld a, h
opcodes[0x7D] = ldR8nR8(A, L); // ld a, l
opcodes[0x7E] = ldR8HLPt(A);   // ld a, (hl)
opcodes[0x7F] = ldR8nR8(A, A); // ld a, a
// 8x
opcodes[0x80] = ADDreg(B); // add a, b
opcodes[0x81] = ADDreg(C); // add a, c
opcodes[0x82] = ADDreg(D); // add a, d
opcodes[0x83] = ADDreg(E); // add a, e
opcodes[0x84] = ADDreg(H); // add a, h
opcodes[0x85] = ADDreg(L); // add a, l
opcodes[0x86] = ADDHLPt;   // add a, (hl)
opcodes[0x87] = ADDreg(A); // add a, a
opcodes[0x88] = ADCreg(B); // adc a, b
opcodes[0x89] = ADCreg(C); // adc a, c
opcodes[0x8A] = ADCreg(D); // adc a, d
opcodes[0x8B] = ADCreg(E); // adc a, e
opcodes[0x8C] = ADCreg(H); // adc a, h
opcodes[0x8D] = ADCreg(L); // adc a, l
opcodes[0x8E] = ADCHLPt;   // adc a, (hl)
opcodes[0x8F] = ADCreg(A); // adc a, a
// 9x
opcodes[0x90] = SUBreg(B); // sub a, b
opcodes[0x91] = SUBreg(C); // sub a, c
opcodes[0x92] = SUBreg(D); // sub a, d
opcodes[0x93] = SUBreg(E); // sub a, e
opcodes[0x94] = SUBreg(H); // sub a, h
opcodes[0x95] = SUBreg(L); // sub a, l
opcodes[0x96] = SUBHLPt;   // sub a, (hl)
opcodes[0x97] = SUBreg(A); // sub a, a
opcodes[0x98] = SBCreg(B); // sbc a, b
opcodes[0x99] = SBCreg(C); // sbc a, c
opcodes[0x9A] = SBCreg(D); // sbc a, d
opcodes[0x9B] = SBCreg(E); // sbc a, e
opcodes[0x9C] = SBCreg(H); // sbc a, h
opcodes[0x9D] = SBCreg(L); // sbc a, l
opcodes[0x9E] = SBCHLPt;   // sbc a, (hl)
opcodes[0x9F] = SBCreg(A); // sbc a, a
// Ax
opcodes[0xA0] = ANDreg(B); // and a, b
opcodes[0xA1] = ANDreg(C); // and a, c
opcodes[0xA2] = ANDreg(D); // and a, d
opcodes[0xA3] = ANDreg(E); // and a, e
opcodes[0xA4] = ANDreg(H); // and a, h
opcodes[0xA5] = ANDreg(L); // and a, l
opcodes[0xA6] = ANDHLPt;   // and a, (hl)
opcodes[0xA7] = ANDreg(A); // and a, a
opcodes[0xA8] = XORreg(B); // xor a, b
opcodes[0xA9] = XORreg(C); // xor a, c
opcodes[0xAA] = XORreg(D); // xor a, d
opcodes[0xAB] = XORreg(E); // xor a, e
opcodes[0xAC] = XORreg(H); // xor a, h
opcodes[0xAD] = XORreg(L); // xor a, l
opcodes[0xAE] = XORHLPt;   // xor a, (hl)
opcodes[0xAF] = XORreg(A); // xor a, a
// Bx
opcodes[0xB0] = ORreg(B); // or a, b
opcodes[0xB1] = ORreg(C); // or a, c
opcodes[0xB2] = ORreg(D); // or a, d
opcodes[0xB3] = ORreg(E); // or a, e
opcodes[0xB4] = ORreg(H); // or a, h
opcodes[0xB5] = ORreg(L); // or a, l
opcodes[0xB6] = ORHLPt;   // or a, (hl)
opcodes[0xB7] = ORreg(A); // or a, a
opcodes[0xB8] = CPreg(B); // cp a, b
opcodes[0xB9] = CPreg(C); // cp a, c
opcodes[0xBA] = CPreg(D); // cp a, d
opcodes[0xBB] = CPreg(E); // cp a, e
opcodes[0xBC] = CPreg(H); // cp a, h
opcodes[0xBD] = CPreg(L); // cp a, l
opcodes[0xBE] = CPHLPt;   // cp a, (hl)
opcodes[0xBF] = CPreg(A); // cp a, a
// Cx
opcodes[0xC0] = RETnz; // ret nz
opcodes[0xC1] = POP(B); // pop bc
opcodes[0xC2] = JPnz; // jp nz, u16
opcodes[0xC3] = JP; // jp u16
opcodes[0xC4] = CALLnz; // call nz, u16
opcodes[0xC5] = PUSH(B); // push bc
opcodes[0xC6] = ADDImm; // add a, u8
opcodes[0xC7] = RSTf(0x00); // rst 00h
opcodes[0xC8] = RETz; // ret z
opcodes[0xC9] = RET; // ret
opcodes[0xCA] = JPz; // jp z, u16
opcodes[0xCB] = cb;
opcodes[0xCC] = CALLz; // call z, u16
opcodes[0xCD] = CALL; // call u16
opcodes[0xCE] = ADCImm; // adc a, u8
opcodes[0xCF] = RSTf(0x08); // rst 08h
// Dx
opcodes[0xD0] = RETnc; // ret nc
opcodes[0xD1] = POP(D); // pop de
opcodes[0xD2] = JPnc; // jp nc, u16
opcodes[0xD3] = unk; // UNDEFINED
opcodes[0xD4] = CALLnc; // call nc, u16
opcodes[0xD5] = PUSH(D); // push de
opcodes[0xD6] = SUBImm; // sub a, u8
opcodes[0xD7] = RSTf(0x10); // rst 10h
opcodes[0xD8] = RETc; // ret c
opcodes[0xD9] = RETi; // reti
opcodes[0xDA] = JPc; // jp c, u16
opcodes[0xDB] = unk; // UNDEFINED
opcodes[0xDC] = CALLc; // call c, u16
opcodes[0xDD] = unk; // UNDEFINED
opcodes[0xDE] = SBCImm; // sbc a, u8
opcodes[0xDF] = RSTf(0x18); // rst 18h
// Ex
opcodes[0xE0] = LDFFImmA; // ld ($FF00 + u8), a
opcodes[0xE1] = POP(H); // pop hl
opcodes[0xE2] = LDFFCA; // ld ($FF00 + c), a
opcodes[0xE3] = unk; // UNDEFINED
opcodes[0xE4] = unk; // UNDEFINED
opcodes[0xE5] = PUSH(H); // push hl
opcodes[0xE6] = ANDImm; // and a, u8
opcodes[0xE7] = RSTf(0x20); // rst 20h
opcodes[0xE8] = ADDSPImm; // add sp, i8
opcodes[0xE9] = JPHL; // jp hl
opcodes[0xEA] = ldImmPtA; // ld (u16), a
opcodes[0xEB] = unk; // UNDEFINED
opcodes[0xEC] = unk; // UNDEFINED
opcodes[0xED] = unk; // UNDEFINED
opcodes[0xEE] = XORImm; // xor a, u8
opcodes[0xEF] = RSTf(0x28); // rst 28h
// Fx
opcodes[0xF0] = LDAFFImm; // ld a, (ff00 + u8)
opcodes[0xF1] = POP(A); // pop af
opcodes[0xF2] = LDAFFC; // ld a, (ff00 + c)
opcodes[0xF3] = di; // di
opcodes[0xF4] = unk; // UNDEFINED
opcodes[0xF5] = PUSH(A); // push af
opcodes[0xF6] = ORImm; // or a, u8
opcodes[0xF7] = RSTf(0x30); // rst 30h
opcodes[0xF8] = LDHLSPi8; // ld hl, sp + i8
opcodes[0xF9] = LDSPHL; // ld sp, hl
opcodes[0xFA] = ldAImmPt; // ld a, (u16)
opcodes[0xFB] = ei; // ei
opcodes[0xFC] = unk; // UNDEFINED
opcodes[0xFD] = unk; // UNDEFINED
opcodes[0xFE] = CPImm; // cp a, u8
opcodes[0xFF] = RSTf(0x38); // rst 38h

module.exports = opcodes;