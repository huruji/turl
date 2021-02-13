import * as fs from 'fs'
import * as path from 'path'
import * as cp from 'child_process'
import { pick, getConfig } from './utils'
import thriftParser from './thriftParser'
import { ThriftInfo } from './thriftParser'
import ClientGenerator from './clientGenerator'
import MethodGenerator from './methodGenerator'


class Engine {
  config: TurlCliOpt
  thriftInfo: ThriftInfo
  sourceDir: string
  thriftGenFolder: string
  constructor(opt: TurlCliOpt) {
    this.handleCliOpts(opt)
    this.config = getConfig(this.config)
    this.thriftGenFolder = 'gen-nodejs'
    if (!this.config.idl) {
      throw new Error('a thrift idl file is needed')
    }
    if (!this.config.method) {
      throw new Error('a rpc method is needed')
    }
    if (!this.config){

    }
    this.parseIdl()
    this.initPlugins()
    this.applyPlugins()
  }

  generateNodeJsClient() {
    const dest = path.resolve(__dirname, 'turl_gen')
    this.sourceDir = dest
    if(!fs.existsSync(dest)) {
      fs.mkdirSync(dest)
    }
    cp.execSync(`thrift -r -o ${dest} --gen js:node ${this.config.idl}`);
  }

  generateClient() {
    const generator = new ClientGenerator(this.thriftInfo, this.sourceDir, this.thriftGenFolder)
    generator.generate()
  }

  generateMethod() {
    const generator = new MethodGenerator(this.config?.method!, this.sourceDir, this.config)
    generator.generate()
  }

  async run(): Promise<void> {
    this.generateNodeJsClient()
    this.generateClient()
    this.generateMethod()
  }

  parseIdl():void {
    const thriftInfo = thriftParser(this.config.idl!)
    this.thriftInfo = thriftInfo
    const existMethod = this.thriftInfo.functionNames.includes(this.config?.method!)
    if (!existMethod) {
      throw new Error(`method ${this.config?.method} is not exist in idl file`)
    }
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
