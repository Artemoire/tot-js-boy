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

const {
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
} = require('./shifts');

const {
    BITr8,
    BITHLPt,
    SETr8,
    SETHLPt,
    RESr8,
    RESHLPt
} = require('./bits');

function bitOps(rOp, hlOp, offset) {
    for(var i = 0; i < 8; i++) {
        cbPrefix[offset + i * 8 + 0] = rOp(i, B); // XXX i, b
        cbPrefix[offset + i * 8 + 1] = rOp(i, C); // XXX i, c
        cbPrefix[offset + i * 8 + 2] = rOp(i, D); // XXX i, d
        cbPrefix[offset + i * 8 + 3] = rOp(i, E); // XXX i, e
        cbPrefix[offset + i * 8 + 4] = rOp(i, H); // XXX i, h
        cbPrefix[offset + i * 8 + 5] = rOp(i, L); // XXX i, l
        cbPrefix[offset + i * 8 + 6] = hlOp(i); // XXX i, (hl)
        cbPrefix[offset + i * 8 + 7] = rOp(i, A); // XXX i, a
    }
}

const cbPrefix = new Array(256);

// 0x
cbPrefix[0x00] = RLCr8(B); // rlc b
cbPrefix[0x01] = RLCr8(C); // rlc c
cbPrefix[0x02] = RLCr8(D); // rlc d
cbPrefix[0x03] = RLCr8(E); // rlc e
cbPrefix[0x04] = RLCr8(H); // rlc h
cbPrefix[0x05] = RLCr8(L); // rlc l
cbPrefix[0x06] = RLCHLPt;  // rlc (hl)
cbPrefix[0x07] = RLCr8(A); // rlc a
cbPrefix[0x08] = RRCr8(B); // rrc b
cbPrefix[0x09] = RRCr8(C); // rrc c
cbPrefix[0x0A] = RRCr8(D); // rrc d
cbPrefix[0x0B] = RRCr8(E); // rrc e
cbPrefix[0x0C] = RRCr8(H); // rrc h
cbPrefix[0x0D] = RRCr8(L); // rrc l
cbPrefix[0x0E] = RRCHLPt;  // rrc (hl)
cbPrefix[0x0F] = RRCr8(A); // rrc a
// 1x
cbPrefix[0x10] = RLr8(B); // rl b
cbPrefix[0x11] = RLr8(C); // rl c
cbPrefix[0x12] = RLr8(D); // rl d
cbPrefix[0x13] = RLr8(E); // rl e
cbPrefix[0x14] = RLr8(H); // rl h
cbPrefix[0x15] = RLr8(L); // rl l
cbPrefix[0x16] = RLHLPt;  // rl (hl)
cbPrefix[0x17] = RLr8(A); // rl a
cbPrefix[0x18] = RRr8(B); // rr b
cbPrefix[0x19] = RRr8(C); // rr c
cbPrefix[0x1A] = RRr8(D); // rr d
cbPrefix[0x1B] = RRr8(E); // rr e
cbPrefix[0x1C] = RRr8(H); // rr h
cbPrefix[0x1D] = RRr8(L); // rr l
cbPrefix[0x1E] = RRHLPt;  // rr (hl)
cbPrefix[0x1F] = RRr8(A); // rr a
// 2x
cbPrefix[0x20] = SLAr8(B); // sla b
cbPrefix[0x21] = SLAr8(C); // sla c
cbPrefix[0x22] = SLAr8(D); // sla d
cbPrefix[0x23] = SLAr8(E); // sla e
cbPrefix[0x24] = SLAr8(H); // sla h
cbPrefix[0x25] = SLAr8(L); // sla l
cbPrefix[0x26] = SLAHLPt;  // sla (hl)
cbPrefix[0x27] = SLAr8(A); // sla a
cbPrefix[0x28] = SRAr8(B); // sra b
cbPrefix[0x29] = SRAr8(C); // sra c
cbPrefix[0x2A] = SRAr8(D); // sra d
cbPrefix[0x2B] = SRAr8(E); // sra e
cbPrefix[0x2C] = SRAr8(H); // sra h
cbPrefix[0x2D] = SRAr8(L); // sra l
cbPrefix[0x2E] = SRAHLPt;  // sra (hl)
cbPrefix[0x2F] = SRAr8(A); // sra a
// 3x
cbPrefix[0x30] = SWAPr8(B); // swap b
cbPrefix[0x31] = SWAPr8(C); // swap c
cbPrefix[0x32] = SWAPr8(D); // swap d
cbPrefix[0x33] = SWAPr8(E); // swap e
cbPrefix[0x34] = SWAPr8(H); // swap h
cbPrefix[0x35] = SWAPr8(L); // swap l
cbPrefix[0x36] = SWAPHLPt;  // swap (hl)
cbPrefix[0x37] = SWAPr8(A); // swap a
cbPrefix[0x38] = SRLr8(B); // srl b
cbPrefix[0x39] = SRLr8(C); // srl c
cbPrefix[0x3A] = SRLr8(D); // srl d
cbPrefix[0x3B] = SRLr8(E); // srl e
cbPrefix[0x3C] = SRLr8(H); // srl h
cbPrefix[0x3D] = SRLr8(L); // srl l
cbPrefix[0x3E] = SRLHLPt;  // srl (hl)
cbPrefix[0x3F] = SRLr8(A); // srl a

// 4x-7x
bitOps(BITr8, BITHLPt, 0x40);
// 8x-Bx
bitOps(RESr8, RESHLPt, 0x80);
// Cx-Fx
bitOps(SETr8, SETHLPt, 0xC0);

module.exports = cbPrefix;