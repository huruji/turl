import { parseAllThriftFilesFromDirectory } from './parseAllThriftFilesFromDirectory'
import { getMethodJsonSchema } from './getMethodJsonSchema'
import { getMethodDefaultRequest } from './request'
import { buildJsonSchema } from './buildJsonSchema'
import * as mkdirp from 'mkdirp'
import * as path from 'path'
import * as fs from 'fs'

interface VaseOpt {
  dir: string
  idlDir: string
}

class Vase {
  dir: string
  idlDir: string

  constructor(opt: VaseOpt) {
    this.dir = opt.dir
    this.idlDir = opt.idlDir
  }

  async build() {
    if (!fs.existsSync(this.dir)) {
      mkdirp.sync(this.dir)
    }
    const jsonSchemas = await buildJsonSchema(this.idlDir)
    for (const schema of jsonSchemas) {
      const dirPath = path.resolve(this.dir, `${schema.service}`)
      if (!fs.existsSync(dirPath)) {
        mkdirp.sync(dirPath)
      }
      const jsonFile = fs.createWriteStream(`${dirPath}/${schema.method}.json`);
      jsonFile.write(
        JSON.stringify(schema.requestJson, null, 2)
      )
    }
  }
}

export default Vase
