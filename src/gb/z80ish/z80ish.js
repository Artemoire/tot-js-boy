const opcodes = require('./opcodes')

function z80ish(mmu, bios = false) {
    return {
        halt: false,
        stop: false,
        excpt: false,
        interrupts: false, // true?
        reg: new Uint8Array(8),
        cycle: 0,
        pc: 0,
        sp: 0,
        mmu: mmu,
        execute: function () {
            const instr = this.mmu.read(this.pc);
            opcodes[instr](this);
        },
        reset: function () {
            this.halt = false;
            this.stop = false;
            this.excpt = false;
            this.interrupts = false;
            this.reg[0] = 0;
            this.reg[1] = 0;
            this.reg[2] = 0;
            this.reg[3] = 0;
            this.reg[4] = 0;
            this.reg[5] = 0;
            this.reg[6] = 0;
            this.reg[7] = 0;
            this.cycle = 0;
            this.pc = 0;
            this.sp = 0;
            if (!bios) {
                this.pc = 0x100;
                this.sp = 0xFFFE;
                // values taken from bgb
                this.reg[0] = 0x11; // A
                this.reg[1] = 0x80; // F
                this.reg[2] = 0x00; // B
                this.reg[3] = 0x00; // C
                this.reg[4] = 0xFF; // D
                this.reg[5] = 0x56; // E
                this.reg[6] = 0x00; // H
                this.reg[7] = 0x0D; // L
            }
        }
    }
}

module.exports = z80ish;