import { CommanderStatic } from 'commander'
import init from './init'
import ping from './ping'
import vase from './vase'

export interface CmdPlugin {
  cli(program: CommanderStatic): void
}

const plugins = [init, ping, vase]

export default plugins
