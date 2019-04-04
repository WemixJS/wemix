/*
 * @Description: OutputFile Plugin
 * @LastEditors: sanshao
 * @Date: 2019-02-20 18:41:47
 * @LastEditTime: 2019-04-04 18:04:10
 */
import fs from 'fs-extra'
import npath from 'path'

export default class OutputFilePlugin {
  startWrite (compiler, compilation, callback) {
    const promiseModuleCompile = []
    const writeData = (distPath, data) => {
      if (data && data.path) {
        const dir = npath.parse(distPath).dir
        fs.ensureDirSync(dir)
        return fs.copyFileSync(data.path, distPath)
      }
      return fs.outputFileSync(distPath, data)
    }
    compiler.logger.start('开始写入')
    for (const distPath in compilation.modules) {
      if (
        !/\/npm\//.test(distPath) ||
        /\/npm\/@wemix\/wmcomponents/.test(distPath)
      ) {
        promiseModuleCompile.push(
          writeData(distPath, compilation.modules[distPath])
        )
      }
    }
    Promise.all(promiseModuleCompile)
      .then(() => {
        compiler.overrideVendors = false
        compiler.logger.success('写入成功')
        callback()
      })
      .catch(err => {
        compiler.logger.error(err.stack || err)
      })
  }
  apply (compiler) {
    // 写入到目标目录
    compiler.hooks.emit.tapAsync(
      'OutputFilePlugin',
      (compilation, callback) => {
        if (compiler.removeDist) {
          compiler.removeDist = false
          compiler.logger.success('开始清空目录')
          fs.emptyDir(compiler.options.output, err => {
            if (err) {
              compiler.logger.error(err.stack || err)
              process.exit(1)
            }
            compiler.logger.success('清空目录成功')
            this.startWrite(compiler, compilation, callback)
          })
        } else {
          this.startWrite(compiler, compilation, callback)
        }
      }
    )
  }
}
