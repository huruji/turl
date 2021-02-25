import { CommanderStatic } from 'commander'
import generateConfigFile from '../util/generateConfigFile'
import type { CmdPlugin } from './'

const cli = (program: CommanderStatic): void => {
  program
    .usage('init a turl config file')
    .command('init')
    .description('init a turl config file')
    .action(() => {
      generateConfigFile()
    })
}

export default {
  cli
} as CmdPlugin
