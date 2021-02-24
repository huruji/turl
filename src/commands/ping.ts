import { CommanderStatic } from 'commander';
import Engine from '../engine'
import type { CmdPlugin } from './';

const cli = (program: CommanderStatic): void => {
  program
    .usage("")
    .command("ping")
    .option('-h <host>')
    .option('--host <host>')
    .option('-p <port>')
    .option('--port <port>')
    .option('-i <idl>')
    .option('--idl <idl>')
    .option('-s <service>')
    .option('--service <service>')
    .option('-m <method>')
    .option('--method <method>')
    .option('-a <args>')
    .option('--args <args>')
    .action(async (opt: TurlCliOpt & TurlSimpleCliOpt) => {
      const options: TurlCliOpt = {};
      if (opt.host || opt.h) {
        options.host = opt.host || opt.h;
      }
      if (opt.port || opt.p) {
        options.port = opt.port || opt.p;
      }
      if (opt.idl || opt.i) {
        options.idl = opt.idl || opt.i;
      }
      if (opt.args || opt.a) {
        options.args = opt.args || opt.a;
      }
      if (opt.method || opt.m) {
        options.method = opt.method || opt.m;
      }
      if (opt.service || opt.s) {
        options.service = opt.service || opt.s;
      }
      const turl = new Engine(options);
      turl.readyPing()
      await turl.run();
    });
};

export default {
  cli
} as CmdPlugin;
