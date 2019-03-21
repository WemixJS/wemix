/*
 * @Description: wechat plugin
 * @LastEditors: sanshao
 * @Date: 2019-02-26 15:07:03
 * @LastEditTime: 2019-03-21 19:26:50
 */

import fs from 'fs-extra'
import npath from 'path'
import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import generator from '@babel/generator'

export default class WechatPlugin {
  splitFile (oriPath, compiler, waitCompile) {
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
      distPath = distPath.replace('node_modules', 'dist/npm')
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
            waitCompile,
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
      waitCompile[oriPath] = {
        ...pathParse,
        rule: rule,
        wtype: wtype,
        origin: data,
        distPath: distPath,
      }
      resolve()
    })
  }
  // json config 文件拆分
  splitConfig (compiler, waitCompile, oriPath, distPath, data) {
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
          waitCompile[oriPath] = {
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
  // 递归遍历所有引用文件
  loopCompile (waitCompile, compiler, compilation, callback) {
    compilation.waitCompile = {}
    const promiseWaitCompile = []
    // 待编译文件进行拆分
    for (const oriPath in waitCompile) {
      if (compilation.modifiedFileMTime(oriPath)) {
        promiseWaitCompile.push(this.splitFile(oriPath, compiler, waitCompile))
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
          return new Promise((resolve, reject) => {
            compiler.hooks.beforeSingleCompile.callAsync(
              module.origin,
              oriPath,
              (err, rdata) => {
                if (err) return reject(err)
                compiler.hooks.singleCompile.callAsync(
                  rdata,
                  module.rule,
                  oriPath,
                  (err, rdata) => {
                    if (err) return reject(err)
                    compiler.hooks.afterSingleCompile.callAsync(
                      rdata,
                      oriPath,
                      (err, rdata) => {
                        if (err) return reject(err)
                        this.matchWechatData(
                          rdata,
                          oriPath,
                          module,
                          compiler,
                          compilation
                        )
                          .then(data => {
                            if (/node_modules/.test(oriPath)) {
                              compilation.modules.npm[module.distPath] = data
                            } else {
                              compilation.modules.normal[module.distPath] = data
                            }
                            resolve()
                          })
                          .catch(reject)
                      }
                    )
                  }
                )
              }
            )
          })
        }
        // 拆分后文件进行编译
        for (const oriPath in waitCompile) {
          if (waitCompile[oriPath]) {
            promiseModuleCompile.push(
              compileData(oriPath, waitCompile[oriPath])
            )
          }
        }
        return Promise.all(promiseModuleCompile)
      })
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
  }
  apply (compiler) {
    // 拆分原文件为微信小程序支持的文件，遍历compilation.waitCompile到compilation.modules
    // 遍历compilation.modules,执行beforeSingleCompile singleCompile AfterSingleCompile
    compiler.hooks.beforeRun.tapAsync('RemoveDistPlugin', callback => {
      // 拷贝project.config.json
      const distPath = `${npath.join(
        compiler.options.outputDir,
        'project.config.json'
      )}`
      try {
        if (fs.existsSync(distPath)) {
          compiler.distConfig = fs.readFileSync(distPath, 'utf-8')
        }
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
        this.loopCompile(waitCompile, compiler, compilation, callback)
      }
    )
  }
  matchWechatData (data, oriPath, module, compiler, compilation) {
    return new Promise((resolve, reject) => {
      const parseOriPath = npath.parse(oriPath)
      switch (parseOriPath.ext) {
        case '.js':
          const resolver = compiler.resolverFactory.get('normal', {})
          if (
            !/node_modules/.test(oriPath) &&
            (/getApp\(\)/.test(data) || /getCurrentPages\(\)/.test(data))
          ) {
            compiler.logger.warn(
              ` Warnning in ${oriPath}
                getApp() or getCurrentPages() is not allowed to use
              `
            )
          }
          const ast = parse(data)
          const importPaths = []
          traverse(ast, {
            enter (path) {
              if (
                path.node.type === 'CallExpression' &&
                path.node.callee.name === 'require'
              ) {
                const func = function (params) {
                  const requirePath = path.node.arguments[0].value
                  let baseDir = parseOriPath.dir
                  if (
                    requirePath[0] &&
                    requirePath[0] !== '.' &&
                    requirePath[0] !== '/'
                  ) {
                    baseDir = process.cwd()
                  }
                  return new Promise((resolve, reject) => {
                    resolver
                      .resolve({}, baseDir, requirePath, {})
                      .then(absPath => {
                        resolve({
                          node: path.node.arguments[0],
                          path: absPath,
                        })
                      })
                      .catch(reject)
                  })
                }
                importPaths.push(func())
              }
            },
          })

          Promise.all(importPaths)
            .then(searched => {
              let toPath
              searched.forEach(item => {
                if (/node_modules/.test(item.path)) {
                  toPath = item.path.replace('node_modules', 'dist/npm')
                  if (!compilation.modules.npm[toPath]) {
                    compilation.waitCompile[item.path] = null
                  }
                } else {
                  toPath = item.path.replace(
                    compiler.options.entryDir,
                    compiler.options.outputDir
                  )
                }
                toPath = npath.relative(npath.dirname(module.distPath), toPath)
                if (compiler.options.mixs.test(oriPath)) {
                  toPath = /\.js/.test(toPath)
                    ? toPath.replace('.js', '.wxs')
                    : toPath + '.wxs'
                }
                item.node.value = toPath
              })
              data = generator(ast, {}, data).code
              if (/node_modules/.test(oriPath)) {
                data = this.npmCodeHack(oriPath, data)
              }
              data = this.WechatInsHack(compiler, oriPath, data, module)
              resolve(data)
            })
            .catch(reject)
          break
        case '.less':
          data = data && data.replace(/\.less/gi, '.wxss')
          resolve(data)
          break
        default:
          resolve(data)
      }
    })
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
  npmCodeHack (filePath, content) {
    const basename = npath.basename(filePath)

    switch (basename) {
      case 'lodash.js':
      case '_global.js':
      case 'lodash.min.js':
        content = content.replace(/Function\(['"]return this['"]\)\(\)/, 'this')
        // 支付宝hack
        // content = content.replace(/Function\(['"]return this['"]\)\(\)/, '{}')
        break
      case 'mobx.js':
        // 解决支付宝小程序全局window或global不存在的问题
        content = content.replace(
          /typeof window\s{0,}!==\s{0,}['"]undefined['"]\s{0,}\?\s{0,}window\s{0,}:\s{0,}global/,
          'typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {}'
        )
        break
      case '_html.js':
        content = 'module.exports = false;'
        break
      case '_microtask.js':
        content = content.replace('if(Observer)', 'if(false && Observer)')
        // IOS 1.10.2 Promise BUG
        content = content.replace(
          'Promise && Promise.resolve',
          'false && Promise && Promise.resolve'
        )
        break
      case '_freeGlobal.js':
        content = content.replace(
          'module.exports = freeGlobal;',
          'module.exports = freeGlobal || this || global || {};'
        )
        break
    }
    // 支付宝hack
    // if (content.replace(/\s\r\n/g, '').length <= 0) {
    //   content = '// Empty file'
    // }
    return content
  }
  WechatInsHack (compiler, oriPath, content, module) {
    if (
      module.wtype === 'app' ||
      module.wtype === 'page' ||
      module.wtype === 'component'
    ) {
      let replace = ''
      content = content.replace(
        /exports\.default\s*=\s*((\w+);)/gi,
        (m, b, defaultExport) => {
          if (defaultExport === 'undefined') {
            return ''
          }
          if (module.wtype === 'app') {
            const vars = content.match(/\((.+?)\.default\.app\)/)[1]
            replace = `\nApp(${vars}.default.$createApp(${defaultExport}));\n`
          } else if (module.wtype === 'page') {
            const pagePath = npath
              .join(
                npath.relative(compiler.options.entryDir, module.dir),
                module.name
              )
              .replace(/\\/gi, '/')
            const vars = content.match(/\((.+?)\.default\.page\)/)[1]
            replace = `\nPage(${vars}.default.$createPage(${defaultExport} , '${pagePath}'));\n`
          } else if (module.wtype === 'component') {
            const pagePath = npath
              .join(
                npath.relative(compiler.options.entryDir, module.dir),
                module.name
              )
              .replace(/\\/gi, '/')
            const vars = content.match(/\((.+?)\.default\.component\)/)[1]
            replace = `\nComponent(${vars}.default.$createComponent(${defaultExport} , '${pagePath}'));\n`
          }
          return ''
        }
      )
      content += replace
    }
    /**
     * 转换 foobar instanceof Function 为 typeof foobar ==='function'
     * 由于微信重定义了全局的Function对象，所以moment等npm库会出现异常
     */
    content = content.replace(/([\w[\]a-d.]+)\s*instanceof Function/g, function (
      matchs,
      word
    ) {
      return ' typeof ' + word + " ==='function' "
    })
    return content
  }
}
