import * as fs from 'fs'
import * as path from 'path'
import * as cp from 'child_process'
import ora from 'ora'
import { pick, getConfig } from './utils'
import thriftParser from './thriftParser'
import { ThriftInfo } from './thriftParser'
import ClientGenerator from './clientGenerator'
import MethodGenerator from './methodGenerator'
import Vase from './vase/index'
import logger from './util/logger'
import chalk from 'chalk'
import * as jsonfile from 'jsonfile'


class Engine {
  config: TurlCliOpt
  thriftInfo: ThriftInfo[]
  sourceDir: string
  thriftGenFolder: string
  methodFilePath: string
  spinner: ora.Ora
  constructor(opt: TurlCliOpt) {
    this.handleCliOpts(opt)
    this.config = getConfig(this.config)
    this.thriftGenFolder = 'gen-nodejs'
    // this.spinner = ora('parsing idl file')
    // this.spinner.prefixText = 'turl:'
    // this.spinner.start()
    this.initPlugins()
    this.applyPlugins()
  }

  readyPing() {
    if (!this.config.idl) {
      throw new Error('a thrift idl file is needed')
    }
    if (!this.config.method) {
      throw new Error('a rpc method is needed')
    }
    this.parseIdl()
    this.getArgs()
  }

  async buildVase() {
    debugger;
    const vaseInstance = new Vase({
      idlDir: path.dirname(this.config.idl!),
      dir: this.config.vaseDir!
    })
    await vaseInstance.build()
    logger.info(`vase files created at ${chalk.cyan(this.config.vaseDir)}`);
  }

  async run(): Promise<void> {
    try{
      this.generateNodeJsClient()
      this.generateClient()
      this.generateMethod()
      this.runThritClient()
    } catch(err) {
      console.log(err)
    }
  }

  async runThritClient() {
    cp.fork(this.methodFilePath, [], {});
  }

  generateNodeJsClient() {
    // this.spinner.text = 'generate client from idl file'
    const dest = path.resolve(__dirname, 'turl_gen')
    this.sourceDir = dest
    if(!fs.existsSync(dest)) {
      fs.mkdirSync(dest)
    }
    cp.execSync(`thrift -r -o ${dest} --gen js:node ${this.config.idl}`);
  }

  generateClient() {
    // this.spinner.text = "generate thrift client"
    const generator = new ClientGenerator(this.thriftInfo, this.sourceDir, this.thriftGenFolder)
    generator.generate()
    // this.spinner.stop()
  }

  generateMethod() {
    // this.spinner.text = 'generate thrift method'
    const generator = new MethodGenerator(this.config?.method!, this.config?.service!, this.sourceDir, this.config)
    generator.generate()
    this.methodFilePath = generator.filePath
  }

  parseIdl():void {
    const thriftInfo = thriftParser(this.config.idl!)
    this.thriftInfo = thriftInfo
    const existMethod = this.thriftInfo.reduce((acc, info) => {
      for (const [, val] of Object.entries(info.service || {})) {
        acc = acc.concat(val.functionNames || [])
      }
      return acc
    }, [] as string[]).includes(this.config?.method!)
    if (!existMethod) {
      throw new Error(`method ${this.config?.method} is not exist in idl file`)
    }
    let serviceName = ''
    if (this.config.service) {
      const serviceNames = this.thriftInfo.reduce((acc, info) => {
        acc = acc.concat(info.serviceNames || [])
        return acc
      }, [] as string[])
      serviceName = serviceNames.find(s => s.toLowerCase() === this.config.service?.trim().toLowerCase()) || ''
      if (!serviceName) {
        throw new Error(`service ${this.config.service} is not existed in idl file`)
      }
      this.config.service = serviceName
    } else {
      for (let i = 0; i < this.thriftInfo.length; i++) {
        const info = this.thriftInfo[i];
        for (const [, service] of Object.entries(info?.service ?? {})) {
          if (service.functionNames.includes(this.config?.method ?? '')) {
            serviceName = service.name
          }
          if (serviceName) {
            break
          }
        }
        if(serviceName) {
          break
        }
      }
    }
    this.config.service = serviceName
  }

  getArgs():void {
    const { method, args, service } = this.config
    let serviceName = service
    const needValidateService = !!service
    const thriftInfo = this.thriftInfo
    let func: { args: {type: string, name: string}[] } | null= null
    for (let i = 0; i < this.thriftInfo.length; i++) {
      const info = this.thriftInfo[i];
      for (const [key, serviceInfo] of Object.entries(info.service || {})) {
        let isThisService = true
        if (needValidateService && key !== service) {
          isThisService = false
        }
        if (isThisService && serviceInfo.functions[method!]) {
          serviceName = key
          func = serviceInfo.functions[method!]
        }
      }
    }
    if (!func || func?.args?.length === 0) {
      return
    }
    let jsonPath = path.resolve(this.config.vaseDir!, `${serviceName}/${method}.json`)
    if (!fs.existsSync(jsonPath)) {
      return
    }
    const argJson = jsonfile.readFileSync(jsonPath)

    let methodArgs = ''
    for (let i = 0; i < func.args.length; i++) {
      const arg = func.args[i]
      const param = argJson[arg.name]
      if(!Object.keys(argJson || {}).includes(arg.name)) {
        methodArgs += ', '
      } else {
        if (typeof param === 'string') {
          methodArgs += `"${param}", `
        } else if(typeof param === 'object') {
          methodArgs += `${JSON.stringify(param)}, `
        } else {
          methodArgs += `${param}, `
        }
      }
    }
    this.config.args = methodArgs
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
