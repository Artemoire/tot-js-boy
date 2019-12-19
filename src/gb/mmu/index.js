const {
    noMBC
} = require('./mbc');

module.exports = () => {
    return {
        ram: new Uint8Array(Math.pow(2, 16)),
        rom: null,
        mbc: noMBC,
        romBankOffset: 0,
        read: function (addr) {
            if (addr <= 0x3fff) {
                return this.rom[addr];
            }
            if (addr <= 0x7fff) {
                return this.rom[addr + this.romBankOffset];
            }

            return this.ram[addr];
        },
        write: function (addr, val) {
            if (addr <= 0x7fff) {
                // this.mbc.write()
                return;
            }

            if (addr > 0xBFFF && addr < 0xDE00) {
                this.ram[addr + 0x2000] = val;
            } else if (addr > 0xDFFF && addr < 0xFE00) {
                this.ram[addr - 0x2000] = val;
            }
            this.ram[addr] = val;
        },
        loadROM: function (rom) {
            this.rom = rom;
        }
    }
}