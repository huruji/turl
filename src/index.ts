#!/usr/bin/env node --max_old_space_size=4096 --inspect-brk

import('v8-compile-cache')
import program from 'commander'
import Engine from './engine'


program.usage("")
.option('-h <host>')
.option('--host <host>')
.option('-p <port>')
.option('--port <port>')
.option('-i <idl>')
.option('--idl <idl>')
.option('-s <service>')
.option('--service <service>')
.option('-m <method>')
.option('--method <method>')
.option('-a <args>')
.option('--args <args>')
.action(async (opt: TurlCliOpt & TurlSimpleCliOpt) => {
  const options: TurlCliOpt = {}
  options.host = opt.host || opt.h
  options.port = opt.port || opt.p
  options.idl = opt.idl || opt.i
  options.args = opt.args || opt.a
  options.method = opt.method || opt.m
  options.service = opt.service || opt.s
  const turl = new Engine(options)
  await turl.run()
})

program.parse(process.argv)

process.on('unhandledRejection', (error) => {
  console.error(error)
  process.exit(1)
})



