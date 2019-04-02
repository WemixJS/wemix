/*
 * @Description: 构建项目
 * @LastEditors: sanshao
 * @Date: 2019-02-20 15:43:33
 * @LastEditTime: 2019-04-02 19:22:55
 */

import wemix from '../core'
import logger from '../utils/logger'

export default function build (program) {
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
    compiler.removeDist = true
    if (program.watch) {
      compiler.run(function (error) {
        if (error) {
          compilerCallback(error)
        } else {
          compiler.watch({}, compilerCallback)
        }
      })
    } else {
      compiler.run(compilerCallback)
    }
  } catch (err) {
    throw err
  }
}
