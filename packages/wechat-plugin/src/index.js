/*
 * @Description: wechat plugin
 * @LastEditors: sanshao
 * @Date: 2019-02-26 15:07:03
 * @LastEditTime: 2019-02-28 18:50:39
 */

import fs from 'fs-extra'
import npath from 'path'

export default class WechatPlugin {
  callAsync (list, data, compiler, done) {
    let index = 0
    function next (err, data) {
      if (index >= list.length) return done(null, data)
      if (err) return done(err)
      try {
        const resolve = compiler.resolverFactory.get('normal', {})
        resolve.resolve(
          {},
          process.cwd(),
          list[index].loader,
          {},
          (err, file) => {
            if (err) throw err
            const fn = require(file).default
            fn(data, list[index++].options, next)
          }
        )
      } catch (err) {
        compiler.logger.error(err.stack || err)
        process.exit(1)
      }
    }
    next(null, data)
  }
  grabConfigFromScript (str, n) {
    let stash = []
    let rst = ''
    for (let i = n, l = str.length; i < l; i++) {
      if (str[i] === '{') {
        stash.push('{')
      }
      if (str[i] === '}') {
        stash.pop()
        if (stash.length === 0) {
          rst += '}'
          break
        }
      }
      if (stash.length) {
        rst += str[i]
      }
    }
    return rst
  }
  splitData (compiler, compilation, oriPath, distPath, data, rule) {
    const distPathParse = npath.parse(distPath)
    if (distPathParse.ext === '.js') {
      if (/extends\s*wemix\.(app|page|component)/.test(data)) {
        data.replace(
          /export\s*default\s*class\s*(\w+)\s*extends/gi,
          (m, title) => {
            let match = data.match(
              new RegExp(`[\\s\\r\\n]${title}.config\\s*=[\\s\\r\\n]*`)
            )
            match = match ? match[0] : undefined
            let json = match
              ? this.grabConfigFromScript(
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
            const dist = `${npath.join(
              distPathParse.dir,
              distPathParse.name
            )}.json`
            compilation.modules[dist] = {
              origin: JSON.stringify(json || {}),
              rule: compiler.getRule(dist),
            }
          }
        )
      }
      compilation.modules[distPath] = {
        origin: data,
        rule: rule,
      }
    } else if (distPathParse.ext === '.html') {
      data = data.replace(/<script>([\s\S]*?)<\/script>/g, function (a, b) {
        const dist = `${npath.join(distPathParse.dir, distPathParse.name)}.wxs`
        compilation.modules[dist] = {
          origin: b,
          rule: compiler.getRule(
            `${npath.join(distPathParse.dir, distPathParse.name)}.js`
          ),
        }
        return ''
      })
      compilation.modules[distPath] = {
        origin: data,
        rule: rule,
      }
    } else {
      compilation.modules[distPath] = {
        origin: data,
        rule: rule,
      }
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
      if (fs.existsSync(distPath)) {
        compiler.distConfig = fs.readFileSync(distPath, 'utf-8')
      }
      try {
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
        const promiseWaitCompile = []
        const configPath = `${npath.join(
          compiler.options.context,
          'project.config.json'
        )}`
        const splitFile = oriPath => {
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
            const rule = compiler.getRule(oriPath)
            try {
              if (rule) {
                let data
                if (rule.encoding) {
                  data = fs.readFileSync(oriPath, rule.encoding)
                } else {
                  data = fs.readFileSync(oriPath)
                }
                if (oriPath === configPath && compiler.distConfig) {
                  data = JSON.parse(data)
                  const distConfig = JSON.parse(compiler.distConfig)
                  data = JSON.stringify(Object.assign(distConfig, data))
                }
                this.splitData(
                  compiler,
                  compilation,
                  oriPath,
                  distPath,
                  data,
                  rule
                )
                resolve()
              } else {
                compilation.modules[distPath] = {
                  origin: fs.readFileSync(oriPath),
                  rule: null,
                }
                resolve()
              }
            } catch (err) {
              reject(err)
            }
          })
        }
        compilation.waitCompile[configPath] = null
        for (const oriPath in compilation.waitCompile) {
          promiseWaitCompile.push(splitFile(oriPath))
        }
        Promise.all(promiseWaitCompile)
          .then(() => {
            const promiseModuleCompile = []
            const compileData = (distPath, module) => {
              return new Promise((resolve, reject) => {
                compiler.hooks.beforeSingleCompile.callAsync(
                  module.origin,
                  (err, rdata) => {
                    if (err) {
                      return reject(err)
                    }
                    compiler.hooks.singleCompile.callAsync(
                      rdata,
                      module.rule,
                      (err, rdata) => {
                        if (err) {
                          return reject(err)
                        }
                        compiler.hooks.afterSingleCompile.callAsync(
                          rdata,
                          (err, rdata) => {
                            if (err) {
                              return reject(err)
                            } else {
                              compilation.modules[distPath] = rdata
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
            for (const distPath in compilation.modules) {
              promiseModuleCompile.push(
                compileData(distPath, compilation.modules[distPath])
              )
            }
            return Promise.all(promiseModuleCompile)
          })
          .then(() => {
            callback()
          })
          .catch(err => {
            compiler.logger.error(err.stack || err)
          })
      }
    )
    // 执行loader
    compiler.hooks.singleCompile.tapAsync(
      'LoaderCompilePlugin',
      (data, rule, callback) => {
        if (rule && rule.use && rule.use.length) {
          rule.use = rule.use.reverse()
          this.callAsync(rule.use, data, compiler, callback)
        } else {
          callback(null, data)
        }
      }
    )
    // 写入到目标目录
    compiler.hooks.emit.tapAsync(
      'WechatEmitPlugin',
      (compilation, callback) => {
        const promiseModuleCompile = []
        const writeData = (distPath, data) => {
          return fs.outputFile(distPath, data)
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
      }
    )
  }
}
