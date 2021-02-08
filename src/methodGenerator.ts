import * as fs from 'fs'

class MethodGenerator {
  method: string
  config: TurlCliOpt
  output: fs.WriteStream
  constructor(method: string, srcDir: string, config: TurlCliOpt) {
    this.method = method
    this.config = config
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
    });
`)
  }

  _writePackageRequires() {
    this.output.write(
`const TClient = require(\'./client\');
`
    );
  }
}

export default MethodGenerator
