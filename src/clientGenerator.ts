import * as fs from 'fs'
import * as path from 'path'
import { ThriftInfo, ServiceInfo } from './thriftParser'

class ClientGenerator {
  thriftInfo: ThriftInfo[]
  srcDir: string
  output: fs.WriteStream
  genFolder: string

  static getClientName(serviceName: string) {
    return `${serviceName}Client`
  }

  constructor(thriftInfo: ThriftInfo[], srcDir: string, genFolder: string) {
    this.thriftInfo = thriftInfo;
    this.srcDir = srcDir
    this.genFolder = genFolder
    this.output = fs.createWriteStream(`${srcDir}/client.js`);
  }

  generate() {
    this._writePackageRequires();
    this._writeClientRequires();
    this.thriftInfo.forEach(info => {
      for (const [serviceName, service] of Object.entries(info.service || {})) {
        this._writeClient(serviceName);
        service?.functionNames.forEach(name => {
          this._writeCall(service.functions[name], info);
        });
        this._writeExport(serviceName)
      }
    });
    // this._writeExport();
  }

  // _writeServiceClient(serviceName: string, service: ServiceInfo) {
  //   this._writeClient()
  // }
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
        this._writeRequire(`${path.basename(file, '.js')}`, file);
      } else {
        this._writeRequire(`${path.basename(file, '.js')}_Service`, file);
      }
    });
  }

  _writeClient(serviceName: string) {
    const clientName = ClientGenerator.getClientName(serviceName)
    this.output.write(`
class ${clientName} {
  constructor(serviceUrl, port) {
    const connection = thrift.createConnection(serviceUrl, port, {
      transport : thrift.TBufferedTransport,
      protocol : thrift.TBinaryProtocol
    });

    connection.on('error', function(err) {
      //assert(false, err);
      console.log('server connection err: ', err)
    });

    this.client = Promise.promisifyAll(thrift.createClient(${serviceName}_Service, connection));
  }`
    );
  }

  getRequestPrams(tFunc:any, info: ThriftInfo) {
    if (tFunc.args.length === 0) {
      return ''
    }
    let requestParam = ''

    for (let i = 0; i < tFunc.args.length; i++) {
      const arg = tFunc.args[i];
      const enumType = info?.enums[arg?.type];
      const structType = info?.structs[arg?.type];
      if (arg.type === 'string') {
        requestParam += `args[${i}] + '', `;
      } else if (arg.type === 'bool') {
        requestParam += `!!args[${i}], `;
      } else if (arg.type === 'i64' || arg.type === 'i32' || arg.type === 'i16' || enumType) {
        requestParam += `parseInt(args[${i}]), `;
      } else if (structType) {
        requestParam += `new ttypes.${arg.type}(args[${i}]), `
      }
    }
    return requestParam
  }

  _writeCall(tFunc:any, info: ThriftInfo) {
    const requestParam = this.getRequestPrams(tFunc, info)
    this.output.write(`
    ${tFunc.name}(...args) {
`
    );
    this.output.write(
`    return this.client.${tFunc.name}Async(${requestParam})
      .then((response) => {
        console.log('Calling ${tFunc.name}...');
        return response;
      });
  }`
    )
  }

  _writeExport(serviceName: string) {
    const clientName = ClientGenerator.getClientName(serviceName)
    this.output.write(
`
}
module.exports.${clientName} = ${clientName}
`
    );
  }
}

export default ClientGenerator
