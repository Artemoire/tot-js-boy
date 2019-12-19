const z80ish = require('./z80ish');
const mmuFactory = require('./mmu');

function handleInterrupt(gboy, newPC, intMask) {
    throw `unhandled int`;
}

function gb() {
    var mmu = mmuFactory();

    return {
        cpu: z80ish(mmu),
        mmu: mmu,
        loadROM: function(rom) {
            this.cpu.reset();
            this.mmu.loadROM(rom);
        },
        step: function() {            
            this.cpu.execute();

            // if (this.cpu.interrupts) { // if IME
            //     var intF = this.mmu.ram[0xFFFF] & this.mmu.ram[0xFF0F];
            //     if (intF & (1 << 0)) // VBLANK
            //         handleInterrupt(this, 0x40, 0x01);
            //     } else if (intF & (1 << 1)) { // LCDC
            //         throw `not implemented`;
            //     } else if (intF & (1 << 2)) { // Timer
            //         throw `not implemented`;
            //     } else if (intF & (1 << 3)) { // Serial
            //         throw `not implemented`;
            //     } else if (intF & (1 << 4)) { // H2Lp10-p13
            //         throw `not implemented`;
            //     } 
            // }
        }
    }
}

module.exports = gb;