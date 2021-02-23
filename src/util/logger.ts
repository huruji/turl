import * as chalk from 'chalk'

const logger = {
  log(prefix: string, ...args: string[]) {
    if (!args.length) {
      return;
    }
    console.log.apply(console, [prefix, ...args]);
  },
  info(...args: string[]) {
    const prefix = chalk.green('[INFO]');
    logger.log(prefix, ...args);
  },
  warn(...args: string[]) {
    const prefix = chalk.yellow('[WARNING]');
    logger.log(prefix, ...args);
  },
  error(...args: string[]) {
    if (!args.length) {
      return;
    }
    const prefix = chalk.red('[ERROR]');
    // 将错误信息输出到 stderr
    console.error(prefix, ...args);
  }
};

export default logger
