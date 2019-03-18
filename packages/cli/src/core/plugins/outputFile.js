/*
 * @Description: OutputFile Plugin
 * @LastEditors: sanshao
 * @Date: 2019-02-20 18:41:47
 * @LastEditTime: 2019-03-18 23:20:08
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
          fs.emptyDirSync(compiler.options.outputDir)
        } catch (err) {
          compiler.logger.error(err.stack || err)
          process.exit(1)
        }
        fs.emptyDir(compiler.options.outputDir, err => {
          if (err) {
            compiler.logger.error(err.stack || err)
            process.exit(1)
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
        })
      }
    )
  }
}
