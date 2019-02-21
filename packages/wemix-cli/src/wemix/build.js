/*
 * @Description: 构建项目
 * @LastEditors: sanshao
 * @Date: 2019-02-20 15:43:33
 * @LastEditTime: 2019-02-21 11:40:51
 */

import wemix from '../core'
import logger from '../utils/logger'

export default function build (program) {
  process.env.NODE_ENV = program.env
  // 解析wemix.config.js 以及命令行参数
  let compiler
  try {
    const compilerCallback = function (err) {
      if (err) {
        logger.error(err.stack || err)
        process.exit(1)
      }
    }
    compiler = wemix(program, compilerCallback)
    if (program.watch) {
      compiler.watch({}, compilerCallback)
      logger.info('\nWemix is watching the files…\n')
    } else {
      compiler.run(compilerCallback)
    }
  } catch (err) {
    throw err
  }
}
