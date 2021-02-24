import { parseAllThriftFilesFromDirectory } from './parseAllThriftFilesFromDirectory'
import { getMethodDefaultRequest } from './request'

export interface JSONSchema {
  service: string
  method: string
  requestJson: Record<string, any>
}

export async function buildJsonSchema(idl: string) {
  const { asts, services } = await parseAllThriftFilesFromDirectory(idl)
  // const result: Record<string, any> = {}
  const result: JSONSchema[] = []
  for (const [serviceName, serviceMethods] of Object.entries(services)) {
    // result[serviceName] = {}
    for (const [methodName, methodAst] of Object.entries(serviceMethods)) {
      // const schema = getMethodJsonSchema((methodAst as any).def, asts)
      const schema = getMethodDefaultRequest((methodAst as any).def, asts)
      result.push({
        service: serviceName,
        method: methodName,
        requestJson: schema
      })
    }
  }
  return result
}
