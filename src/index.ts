#!/usr/bin/env node --max_old_space_size=4096

import('v8-compile-cache')
import program from 'commander'
import Engine from './engine'
import commands from './commands'


if (commands.length) {
  commands.forEach(plugin => plugin.cli.apply(null, [program]))
}

if (!process.argv.slice(2).length) {
  program.outputHelp()
}

program.parse(process.argv)

process.on('unhandledRejection', (error) => {
  console.error(error)
  process.exit(1)
})



