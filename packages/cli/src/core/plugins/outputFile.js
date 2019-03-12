/*
 * @Description: OutputFile Plugin
 * @LastEditors: sanshao
 * @Date: 2019-02-20 18:41:47
 * @LastEditTime: 2019-03-11 19:15:01
 */
import fs from 'fs-extra'

export default class OutputFilePlugin {
  apply (compiler) {
    // 写入到目标目录
    compiler.hooks.emit.tapAsync(
      'WechatEmitPlugin',
      (compilation, callback) => {
        const promiseModuleCompile = []
        const writeData = (distPath, data) => {
          return fs.outputFile(distPath, data)
        }
        for (const distPath in compilation.modules.normal) {
          promiseModuleCompile.push(
            writeData(distPath, compilation.modules.normal[distPath])
          )
        }
        for (const distPath in compilation.modules.npm) {
          promiseModuleCompile.push(
            writeData(distPath, compilation.modules.npm[distPath])
          )
        }
        Promise.all(promiseModuleCompile)
          .then(() => {
            callback()
          })
          .catch(err => {
            compiler.logger.error(err.stack || err)
          })
      }
    )
  }
}
