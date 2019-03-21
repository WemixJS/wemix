/*
 * @Description: 日志显示
 * @LastEditors: sanshao
 * @Date: 2019-02-20 15:49:29
 * @LastEditTime: 2019-03-25 09:37:15
 */

import winston from 'winston'
import chalk from 'chalk'
import * as util from './index'
const { combine, timestamp, label, printf } = winston.format

const myCustomLevels = {
  levels: {
    error: 0,
    warn: 1,
    start: 2,
    success: 3,
    info: 4,
    verbose: 5,
    debug: 6,
    silly: 7,
  },
}

const myFormat = printf(info => {
  let message = ''
  let messages = []
  const keys = Object.keys(info)
  keys.forEach(item => {
    if (item !== 'level' && item !== 'label' && item !== 'timestamp') {
      messages.push(
        JSON.stringify(info[item])
          .replace(/\\n\s*/g, '\n')
          .replace(/^['|"](.+?)['|"]$/, function (m, b) {
            return b
          })
      )
    }
  })
  message = messages.join('\n')
  let level = `[${info.level}]`
  switch (info.level) {
    case 'info':
      level = chalk.gray(level.toLocaleUpperCase())
      break
    case 'success':
      level = chalk.yellow(level.toLocaleUpperCase())
      break
    case 'start':
      level = chalk.yellow(level.toLocaleUpperCase())
      break
    case 'warn':
      level = chalk.magenta(level.toLocaleUpperCase())
      break
    case 'error':
      level = chalk.red(level.toLocaleUpperCase())
      message = chalk.red(message)
      break
  }
  const time = util.datetime(new Date(info.timestamp), 'HH:mm:ss')
  return `[${time}] ${level}: ${message}`
})

const logger = winston.createLogger({
  levels: myCustomLevels.levels,
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: combine(label({}), timestamp(), myFormat),
    }),
  ],
})

export default logger
