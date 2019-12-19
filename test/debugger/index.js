const core = require('./core');
const config = require('./config');
const dbg = require('./debugger');

// eval whl(()=>mmu.read(cpu.pc)!=0x22)
// PC def8

core.openROM(config.all[9]);
dbg();

// core.openROM(config.all[0]);

// const vm = require('vm')

// var ctx = {
//     a: 2
// }

// let result = vm.runInNewContext('++ctx.a', { ctx: ctx })
