import assign from 'assign-deep'
import { cosmiconfigSync } from 'cosmiconfig'
import defaultConfig from './defaultConfig'
import * as path from 'path'

export function pick(obj: any, ...keys: string[]): any {
  return Object.keys(obj)
    .filter((key) => keys.includes(key))
    .reduce((newObj, key) => Object.assign(newObj, { [key]: obj[key] }), {})
}

export const getConfig = (cliConfig): TurlCliOpt => {
  let config = defaultConfig
  const explorer = cosmiconfigSync('turl')
  let result
  if (cliConfig.configFile) result = explorer.load(cliConfig.configFile)
  else result = explorer.search()
  console.log('result')
  console.log(result)
  if (result && result.config) {
    config = assign(config, result.config)
  }
  config = assign(config, cliConfig)
  // 如果含有 idl，检查是否是绝对路径，不是绝对路径则处理成绝对路径
  if (config.idl && !path.isAbsolute(config.idl)) {
    config.idl = path.resolve(process.cwd(), config.idl)
  }
  return config
}
