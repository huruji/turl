import * as fs from 'fs'
import { ThriftInfo } from './thriftParser'

class ClientGenerator {
  thriftInfo: ThriftInfo
  srcDir: string
  output: fs.WriteStream
  genFolder: string
  constructor(thriftInfo: ThriftInfo, srcDir: string, genFolder: string) {
    this.thriftInfo = thriftInfo;
    debugger;
    this.srcDir = srcDir
    this.genFolder = genFolder
    this.output = fs.createWriteStream(`${srcDir}/client.js`);
  }

  generate() {
    this._writePackageRequires();
    this._writeClientRequires();
    this._writeClient();
    console.log(this.thriftInfo)
    debugger;
    this.thriftInfo?.functionNames.forEach(name => {
      this._writeCall(this.thriftInfo.functions[name]);
    });

    this._writeExport();
  }

  _stripJsExt(file:string) {
    return file.replace('.js', '');
  }

  _getClientFilesList() {
    return fs.readdirSync(`${this.srcDir}/${this.genFolder}`);
  }

  _isTypesFile(file: string) {
    return file.includes('_types.js');
  }

  _writePackageRequires() {
    this.output.write(
`const thrift = require(\'thrift\');
const Promise = require(\'bluebird\');
`
    );
  }

  _writeRequire(name:string, file:string) {
    this.output.write(`const ${name} = require(\'./${this.genFolder}/${file}\');\n`);
  }

  _writeClientRequires() {
    this._getClientFilesList().forEach(file => {
      if (this._isTypesFile(file)) {
        this._writeRequire('ttypes', file);
      } else {
        this._writeRequire('Service', file);
      }
    });
  }

  _writeClient() {
    this.output.write(`
class Client {
  constructor(serviceUrl, port) {
    const connection = thrift.createConnection(serviceUrl, port, {
      transport : thrift.TBufferedTransport,
      protocol : thrift.TBinaryProtocol
    });

    connection.on('error', function(err) {
      //assert(false, err);
    });

    this.client = Promise.promisifyAll(thrift.createClient(Service, connection));
  }`
    );
  }

  _writeCall(tFunc:any) {
    const arg = tFunc.args[0];
    var requestParam = null;

    this.output.write(`

    ${tFunc.name}(json) {
`
    );

    const enumType = this.thriftInfo.enums[arg?.type];
    const structType = this.thriftInfo.structs[arg?.type];

    // support arg.type = bool, enum, list
    if (tFunc.args.length === 0) {
      requestParam = ''
    } else if (arg.type === 'string' || arg.type === 'bool') {
      requestParam = `json.${arg.name}`;
    } else if (arg.type === 'i64' || arg.type === 'i32' || arg.type === 'i16' || enumType) {
      requestParam = `parseInt(json.${arg.name})`;
    } else if (structType) {
      requestParam = arg.name;
      this.output.write(`    const ${arg.name} = new ttypes.${arg.type}(json.${arg.name});\n`);
    }

    this.output.write(
`    return this.client.${tFunc.name}Async(${requestParam})
      .then((response) => {
        console.log('Calling ${tFunc.name}...');
        return response;
      });
  }`
    )
  }

  _writeExport() {
    this.output.write(
`
}

module.exports = Client;
`
    );
  }
}

export default ClientGenerator
