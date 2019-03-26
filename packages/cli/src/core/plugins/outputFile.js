/*
 * @Description: OutputFile Plugin
 * @LastEditors: sanshao
 * @Date: 2019-02-20 18:41:47
 * @LastEditTime: 2019-03-26 23:19:47
 */
import fs from 'fs-extra'
import npath from 'path'

export default class OutputFilePlugin {
  apply (compiler) {
    // 写入到目标目录
    compiler.hooks.emit.tapAsync(
      'WechatEmitPlugin',
      (compilation, callback) => {
        const promiseModuleCompile = []
        const writeData = (distPath, data) => {
          if (data && data.path) {
            const dir = npath.parse(distPath).dir
            fs.ensureDirSync(dir)
            return fs.copyFileSync(data.path, distPath)
          }
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
