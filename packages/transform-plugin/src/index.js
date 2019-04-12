/*
 * @Description: wechat plugin
 * @LastEditors: sanshao
 * @Date: 2019-02-26 15:07:03
 * @LastEditTime: 2019-04-11 20:15:39
 */

import fs from 'fs-extra'
import npath from 'path'
import Adapter from './adapter'

export default class TransformPlugin {
  /**
   * @description: 拆分json配置文件
   * @param {type}
   * @return:
   */
  beforeSingleCompile (oriPath, pathParse, distPath, compiler, compilation) {
    return new Promise((resolve, reject) => {
      let rdata = fs.readFileSync(oriPath, 'utf8') || ''
      switch (pathParse.ext) {
        // 拆分json配置文件 如果是app page component则还得处理对应的样式文件及html文件
        case '.js':
          if (/@wemix\/core\/index\.js$/.test(oriPath)) {
            compiler.adapter.adapterCorePkg(compiler, rdata, resolve, reject)
          } else {
            compiler.adapter.splitConfig(
              rdata,
              oriPath,
              pathParse,
              distPath,
              compiler,
              compilation,
              resolve,
              reject
            )
          }
          break
        default:
          resolve({ data: rdata })
      }
    })
  }
  afterSingleCompile (
    rdata,
    oriPath,
    pathParse,
    distPath,
    compiler,
    compilation,
    type,
    resolve,
    reject
  ) {
    switch (pathParse.ext) {
      case '.js':
        compiler.adapter.transformJs(
          rdata,
          oriPath,
          pathParse,
          distPath,
          compiler,
          compilation,
          type,
          resolve,
          reject
        )
        break
      case '.html':
        compiler.adapter.transformHtml(
          rdata,
          oriPath,
          pathParse,
          distPath,
          compiler,
          compilation,
          resolve,
          reject
        )
        break
      case '.css':
      case '.less':
      case '.sass':
      case '.scss':
      case '.acss':
      case '.styl':
        compiler.adapter.transformStyle(
          rdata,
          oriPath,
          pathParse,
          distPath,
          compiler,
          compilation,
          resolve,
          reject
        )
        break
      default:
        compilation.modules[distPath] = rdata
        resolve()
    }
  }

  /**
   * @description: 开始编译文件
   * @param {type}
   * @return:
   */
  transform (loader, oriPath, pathParse, distPath, compiler, compilation) {
    return new Promise((resolve, reject) => {
      if (pathParse.ext === '.html' || loader) {
        // js 处理config到json文件
        // js app component page 找对应的html less
        // js 处理引用
        // less 处理引用
        // html 处理替换成小程序支持的格式
        this.beforeSingleCompile(
          oriPath,
          pathParse,
          distPath,
          compiler,
          compilation
        )
          .then(result => {
            let { data, type } = result
            compiler.hooks.beforeSingleCompile.callAsync(
              data,
              oriPath,
              (err, rdata) => {
                if (err) return reject(err)
                compiler.hooks.singleCompile.callAsync(
                  rdata,
                  loader,
                  oriPath,
                  (err, rdata) => {
                    if (err) return reject(err)
                    compiler.hooks.afterSingleCompile.callAsync(
                      rdata,
                      oriPath,
                      (err, rdata) => {
                        if (err) return reject(err)
                        this.afterSingleCompile(
                          rdata,
                          oriPath,
                          pathParse,
                          distPath,
                          compiler,
                          compilation,
                          type,
                          resolve,
                          reject
                        )
                      }
                    )
                  }
                )
              }
            )
          })
          .catch(reject)
      } else {
        compilation.modules[distPath] = { path: oriPath }
        resolve()
      }
    })
  }
  /**
   * @description: 递归遍历文件
   * @param {type}
   * @return:
   */
  loopCompile (waitCompile, compiler, compilation, callback) {
    compilation.waitCompile = {}
    const promiseCompile = []
    for (const oriPath in waitCompile) {
      const pathParse = npath.parse(oriPath)
      // 获取目标文件路径
      let distPath
      if (/\/wemixconfig\//.test(oriPath)) {
        distPath = oriPath.replace(
          npath.join(
            process.cwd(),
            'wemixconfig',
            `${compiler.options.export}`
          ),
          compiler.options.output
        )
      } else {
        distPath = compiler.adapter.getOutputPath(oriPath, compiler)
      }
      // 文件有变动并且之前未编译过则加入编译队列
      if (
        compilation.modifiedFileMTime(oriPath) &&
        !compilation.modules[distPath]
      ) {
        compiler.logger.info(`Compile:${oriPath}`)
        const loader = compiler.getLoader(oriPath)
        if (/\.(js|less|sass|scss|acss|styl)$/.test(pathParse.ext) && !loader) {
          compiler.logger.error(`${pathParse.ext} loader not found!`)
          process.exit(1)
        }
        promiseCompile.push(
          this.transform(
            loader,
            oriPath,
            pathParse,
            distPath,
            compiler,
            compilation
          )
        )
      }
    }

    if (promiseCompile.length > 0) {
      Promise.all(promiseCompile)
        .then(() => {
          if (Object.keys(compilation.waitCompile).length) {
            const waitCompile = Object.assign(compilation.waitCompile)
            this.loopCompile(waitCompile, compiler, compilation, callback)
          } else {
            callback()
          }
        })
        .catch(err => {
          compiler.logger.error(err.stack || err)
        })
    } else {
      callback()
    }
  }
  apply (compiler) {
    compiler.hooks.beforeRun.tapAsync('ProjectAdapterPlugin', callback => {
      compiler.adapter = new Adapter(compiler)
      callback()
    })
    compiler.hooks.compile.tapAsync(
      'TransformPlugin',
      (compilation, callback) => {
        const waitCompile = Object.assign(compilation.waitCompile)

        this.loopCompile(waitCompile, compiler, compilation, callback)
      }
    )
  }
}
