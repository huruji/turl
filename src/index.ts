#!/usr/bin/env node --max_old_space_size=4096

import('v8-compile-cache')
import program from 'commander'
import Engine from './engine'


if (!process.argv.slice(2).length) {
  program.outputHelp()
}

program.usage("")
.option('-h', '--host')
.option('-p', '--port')
.option('-i', '--idl')
.option('-s', '--service')
.option('-m', '--method')
.option('-a', '--args')
.action(async (opt: TurlCliOpt) => {
  const turl = new Engine(opt)
  await turl.run()
})

program.parse(process.argv)

process.on('unhandledRejection', (error) => {
  console.error(error)
  process.exit(1)
})



