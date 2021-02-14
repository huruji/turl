import * as fs from 'fs'
import ClientGenerator from './clientGenerator'

class MethodGenerator {
  method: string
  config: TurlCliOpt
  output: fs.WriteStream
  service: string
  constructor(method: string, service: string, srcDir: string, config: TurlCliOpt) {
    this.method = method
    this.config = config
    this.service = service
    this.output = fs.createWriteStream(`${srcDir}/${method}-method.js`);
  }

  generate() {
    this._writePackageRequires();
    this._writeMethod()
  }
  _writeMethod() {
    this.output.write(`
const client = new TClient('${this.config.host}', ${this.config.port});

client.${this.method}(${this.config.args || ''})
    .then((response) => {
      console.log('the response is')
      console.log(response)
      process.exit(0)
    })
    .catch(err => {
      console.log('${this.method} method error:')
      console.log(err)
      process.exit(1)
    })
`)
  }
  getServiceFromMethod() {

  }
  _writePackageRequires() {
    const clientName = ClientGenerator.getClientName(this.service)
    this.output.write(
`const { ${clientName}: TClient } = require(\'./client\');
`
    );
  }
}

export default MethodGenerator
