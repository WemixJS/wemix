/*
 * @Description: wechat plugin
 * @LastEditors: sanshao
 * @Date: 2019-02-26 15:07:03
 * @LastEditTime: 2019-03-12 14:19:09
 */

import fs from 'fs-extra'
import npath from 'path'

export default class WechatPlugin {
  splitFile (oriPath, compiler, compilation) {
    const configPath = `${npath.join(
      compiler.options.context,
      'wechat.config.json'
    )}`
    let distPath
    if (oriPath === configPath) {
      distPath = `${npath.join(
        compiler.options.outputDir,
        'project.config.json'
      )}`
    } else {
      distPath = oriPath.replace(
        compiler.options.entryDir,
        compiler.options.outputDir
      )
    }
    return new Promise((resolve, reject) => {
      let wtype
      const rule = compiler.getRule(oriPath)
      const pathParse = npath.parse(oriPath)
      let data = fs.readFileSync(oriPath, rule && rule.encoding)
      if (oriPath === configPath && compiler.distConfig) {
        data = JSON.parse(data)
        const distConfig = JSON.parse(compiler.distConfig)
        data = JSON.stringify(Object.assign(distConfig, data))
      }
      switch (pathParse.ext) {
        case '.js':
          wtype = this.splitConfig(
            compiler,
            compilation,
            oriPath,
            distPath,
            data
          )
          if (compiler.options.mixs && compiler.options.mixs.test(distPath)) {
            distPath = distPath.replace(pathParse.ext, '.wxs')
          }
          break
        case '.html':
          distPath = distPath.replace(pathParse.ext, '.wxml')
          break
        case '.less':
        case '.sass':
        case '.scss':
        case '.styl':
          distPath = distPath.replace(pathParse.ext, '.wxss')
          break
      }
      compilation.waitCompile[oriPath] = {
        ...pathParse,
        rule: rule,
        wtype: wtype,
        origin: data,
        distPath: distPath,
      }
      resolve()
    })
  }
  // 递归遍历所有引用文件
  loopCompile (waitCompile, compiler, compilation, callback) {
    const nextWaitCompile = {}
    const promiseWaitCompile = []
    // 待编译文件进行拆分
    for (const oriPath in waitCompile) {
      if (compilation.modifiedFileMTime(oriPath)) {
        promiseWaitCompile.push(this.splitFile(oriPath, compiler, compilation))
      }
    }
    if (promiseWaitCompile.length === 0) {
      compiler.logger.info('无待编译文件')
      return
    }
    Promise.all(promiseWaitCompile)
      .then(() => {
        const promiseModuleCompile = []
        const compileData = (oriPath, module) => {
          // ast 获取引用的路径
          return new Promise((resolve, reject) => {
            compiler.hooks.beforeSingleCompile.callAsync(
              module.origin,
              oriPath,
              (err, rdata) => {
                if (err) {
                  return reject(err)
                }
                compiler.hooks.singleCompile.callAsync(
                  rdata,
                  module.rule,
                  oriPath,
                  (err, rdata) => {
                    if (err) {
                      return reject(err)
                    }
                    compiler.hooks.afterSingleCompile.callAsync(
                      rdata,
                      oriPath,
                      (err, rdata) => {
                        if (err) {
                          return reject(err)
                        } else {
                          compilation.modules.normal[module.distPath] = rdata
                          return resolve()
                        }
                      }
                    )
                  }
                )
              }
            )
          })
        }
        // 拆分后文件进行编译
        for (const oriPath in compilation.waitCompile) {
          promiseModuleCompile.push(
            compileData(oriPath, compilation.waitCompile[oriPath])
          )
        }
        return Promise.all(promiseModuleCompile)
      })
      .then(() => {
        if (Object.keys(nextWaitCompile).length) {
          this.loopCompile(waitCompile, compiler, compilation, callback)
        } else {
          callback()
        }
      })
      .catch(err => {
        compiler.logger.error(err.stack || err)
      })
  }
  // json config 文件拆分
  splitConfig (compiler, compilation, oriPath, distPath, data) {
    distPath = distPath.replace('.js', '.json')
    oriPath = oriPath.replace('.js', '.json')
    const pathParse = npath.parse(oriPath)
    const typeMatch = data.match(/extends\s*wemix\.(app|page|component)/)
    const type = typeMatch ? typeMatch[1] : undefined
    if (type === 'app' || type === 'component' || type === 'page') {
      data.replace(
        /export\s*default\s*class\s*(\w+)\s*extends/gi,
        (m, title) => {
          let match = data.match(
            new RegExp(`[\\s\\r\\n]${title}.config\\s*=[\\s\\r\\n]*`)
          )
          match = match ? match[0] : undefined
          let json = match
            ? compilation.grabConfigFromScript(
              data,
              data.indexOf(match) + match.length
            )
            : false
          try {
            if (json) {
              const code = `return ${json}`
              json = new Function(code)() /* eslint-disable-line */
            }
          } catch (err) {
            throw err
          }
          compilation.waitCompile[oriPath] = {
            ...pathParse,
            rule: compiler.getRule(oriPath),
            origin: JSON.stringify(json || {}),
            distPath: distPath,
          }
        }
      )
      return type
    }
  }
  apply (compiler) {
    // 拆分原文件为微信小程序支持的文件，遍历compilation.waitCompile到compilation.modules
    // 遍历compilation.modules,执行beforeSingleCompile singleCompile AfterSingleCompile
    compiler.hooks.beforeRun.tapAsync('RemoveDistPlugin', callback => {
      // 清空dist目录
      const distPath = `${npath.join(
        compiler.options.outputDir,
        'project.config.json'
      )}`
      try {
        if (fs.existsSync(distPath)) {
          compiler.distConfig = fs.readFileSync(distPath, 'utf-8')
        }
        fs.emptyDirSync(compiler.options.outputDir)
      } catch (err) {
        compiler.logger.error(err.stack || err)
        process.exit(1)
      }
      callback()
    })
    compiler.hooks.compile.tapAsync(
      'WechatCompilePlugin',
      (compilation, callback) => {
        const waitCompile = Object.assign(compilation.waitCompile)
        compilation.waitCompile = {}
        this.loopCompile(waitCompile, compiler, compilation, callback)
      }
    )
  }
}
