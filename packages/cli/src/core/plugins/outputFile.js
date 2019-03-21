/*
 * @Description: OutputFile Plugin
 * @LastEditors: sanshao
 * @Date: 2019-02-20 18:41:47
 * @LastEditTime: 2019-03-26 10:29:28
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
        try {
          fs.emptyDirSync(compiler.options.output)
        } catch (err) {
          compiler.logger.error(err.stack || err)
          process.exit(1)
        }
        fs.emptyDir(compiler.options.output, err => {
          if (err) {
            compiler.logger.error(err.stack || err)
            process.exit(1)
          }
          for (const distPath in compilation.modules) {
            promiseModuleCompile.push(
              writeData(distPath, compilation.modules[distPath])
            )
          }
          Promise.all(promiseModuleCompile)
            .then(() => {
              callback()
            })
            .catch(err => {
              compiler.logger.error(err.stack || err)
            })
        })
      }
    )
  }
}
