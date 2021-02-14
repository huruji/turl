import * as fs from 'fs'
import * as path from 'path'
import thriftParser from 'thrift-parser'

export interface ServiceInfo {
  functions: Record<string, any>
  functionNames: string[]
  name: string
}
export interface ThriftInfo {
  service?: Record<string, ServiceInfo>
  serviceNames?: string[]
  structs?: any
  enums?:any
  file?: string
  include?: Record<string, {path: string}>
}

function buildThriftInfo(thriftAst: Record<string, any>, file: string) :ThriftInfo {
  const service:ThriftInfo['service'] = {}
  for (const [key, value] of Object.entries(thriftAst.service || {})) {
    service[key] = {}
    service[key].functions = value.functions
    service[key].functionNames = Object.keys(value.functions)
    service[key].name = key
  }
  const serviceNames = Object.keys(thriftAst.service)
  const structs = thriftAst.struct;
  const enums = buildDetailedEnumInfo(thriftAst.enum)

  return {
    service,
    serviceNames,
    structs,
    enums,
    file,
    include: thriftAst.include
  };
}

function buildDetailedEnumInfo(enums: Record<string, any>) {

  const calcEnumValues = key => {
    let enumValCounter = -1;

    const items = enums[key].items.map(enumObj => {
      if (enumObj.value) {
        enumValCounter = enumObj.value;
        return enumObj;
      }

      enumValCounter += 1;
      return {
        name: enumObj.name,
        value: enumValCounter
      };
    });

    return {
      [key]: {
        items
      }
    };
  };

  return Object.assign({}, ...Object.keys(enums || {}).map(calcEnumValues));
}

function getSingleThriftInfo(res: ThriftInfo[], file: string) {
  const thriftInfo = buildThriftInfo(thriftParser(fs.readFileSync(file)), file);
  res.push(thriftInfo)
  for (const [key, val] of Object.entries(thriftInfo.include || {})) {
    const idlFile = path.resolve(path.dirname(file), val.path)
    const existedIdl = res.map(info => info.file).includes(idlFile)
    if (fs.existsSync(idlFile) && !existedIdl) {
      getSingleThriftInfo(res, idlFile)
    }
  }
  return res
}

function getAllThriftInfo(file: string) {
  const thriftInfo: ThriftInfo[] = []
  getSingleThriftInfo(thriftInfo, file)
  return thriftInfo
}

function validate(thriftInfo) {
  thriftInfo.functionNames.forEach(name => {
    const tFunc = thriftInfo.functions[name];

    if (tFunc.args.len < 1) {
      throw new Error('Thrift functions with no params are not supported yet');
    }
    if (tFunc.args.len > 1) {
      throw new Error('Thrift functions with more than one param are not supported yet');
    }
  });
}

const parser = (filename: string) => {
  const thriftInfo = getAllThriftInfo(filename)

  return thriftInfo;
};

export default parser
