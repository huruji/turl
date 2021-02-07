import * as fs from 'fs'
import thriftParser from 'thrift-parser'

function buildThriftInfo(thriftAst) {

  const serviceName = Object.keys(thriftAst.service)[0];
  const functions = thriftAst.service[serviceName].functions;
  const functionNames = Object.keys(functions);
  const structs = thriftAst.struct;
  const enums = buildDetailedEnumInfo(thriftAst.enum)

  return {
    serviceName,
    functionNames,
    functions,
    structs,
    enums
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

  return Object.assign({}, ...Object.keys(enums).map(calcEnumValues));
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

module.exports = (filename: string) => {
  const thriftInfo = buildThriftInfo(thriftParser(fs.readFileSync(filename)));
  validate(thriftInfo);
  return thriftInfo;
};
