import { CommanderStatic } from 'commander';
import Engine from '../engine'
import type { CmdPlugin } from './';

const cli = (program: CommanderStatic): void => {
  program
    .usage("generate vase file")
    .command("vase")
    .option('-i <idl>')
    .option('--idl <idl>')
    .action(async (opt: TurlCliOpt & TurlSimpleCliOpt) => {
      const options: TurlCliOpt = {};
      if (opt.idl || opt.i) {
        options.idl = opt.idl || opt.i;
      }
      const turl = new Engine(options);
      await turl.buildVase()
    });
};

export default {
  cli
} as CmdPlugin;
