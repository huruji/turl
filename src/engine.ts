import * as fs from 'fs'
import * as path from 'path'
import { pick, getConfig } from './utils'


class Engine {
  config: any
  constructor(opt: TurlCliOpt) {
    this.handleCliOpts(opt)
    this.config = getConfig(this.config)
    this.findEntry(this.config)
    if (!this.config.idl) {
      throw new Error('a thrift idl file is needed')
    }
    this.initPlugins()
    this.applyPlugins()
  }

  async run(): Promise<void> {

  }

  initPlugins(): void {

  }

  hook(name: string, fn: Function): void {

  }

  applyPlugins(): void {

  }

  findEntry(config): void {

  }

  handleCliOpts(opt: TurlCliOpt): void {
    this.config = {}
    const cliOpts = [ 'host', 'port', 'service', 'method', 'args', 'idl' ]
    // eslint-disable-next-line prefer-spread
    const results = pick.apply(null, [ opt ].concat(cliOpts))
    Object.assign(this.config, results)
  }
}

export default Engine
