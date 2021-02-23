import { CommanderStatic } from 'commander'
import init from './init'
import ping from './ping'

export interface CmdPlugin {
  cli(program: CommanderStatic): void
}

const plugins = [init, ping]

export default plugins
