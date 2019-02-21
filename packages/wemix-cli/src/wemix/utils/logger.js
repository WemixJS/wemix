/*
 * @Description: Logger
 * @LastEditors: sanshao
 * @Date: 2019-02-20 16:17:15
 * @LastEditTime: 2019-02-20 16:18:38
 */

import chalk from 'chalk'
import util from 'util'
import logger from '../../utils/logger'

const format = util.format
const prefix = '   wemix-cli'
const sep = chalk.gray('·')

export const log = function (...args) {
  const msg = format.apply(format, args)
  logger.info(`${chalk.white(prefix)} ${sep} ${msg}`)
}
export const fatal = function (...args) {
  if (args[0] instanceof Error) args[0] = args[0].message.trim()
  const msg = format.apply(format, args)
  logger.error(`${chalk.white(prefix)} ${sep} ${msg}`)
  process.exit(1)
}
export const success = function (...args) {
  const msg = format.apply(format, args)
  logger.success(`${chalk.white(prefix)} ${sep} ${msg}`)
}
