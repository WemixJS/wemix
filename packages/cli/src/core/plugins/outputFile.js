/*
 * @Description: OutputFile Plugin
 * @LastEditors: sanshao
 * @Date: 2019-02-20 18:41:47
 * @LastEditTime: 2019-03-28 10:53:56
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
          return fs.outputFileSync(distPath, data)
        }
        compiler.logger.success('开始清空目录')
        fs.emptyDir(compiler.options.output, err => {
          if (err) {
            compiler.logger.error(err.stack || err)
            process.exit(1)
          }
          compiler.logger.success('清空目录成功')
          compiler.logger.start('开始写入')
          for (const distPath in compilation.modules) {
            promiseModuleCompile.push(
              writeData(distPath, compilation.modules[distPath])
            )
          }
          Promise.all(promiseModuleCompile)
            .then(() => {
              compiler.logger.success('写入成功')
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
