import npath from 'path'
import fs from 'fs-extra'
import htmlparser from 'htmlparser2'
import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
export default {
  npmCodeHack (content, filePath) {
    const basename = npath.basename(filePath)
    switch (basename) {
      case 'lodash.js':
      case '_global.js':
      case 'lodash.min.js':
        content = content.replace(/Function\(['"]return this['"]\)\(\)/, 'this')
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
    return content
  },
  insHack (content, oriPath, compiler, type, pathParse) {
    if (type === 'app' || type === 'page' || type === 'component') {
      let replace = ''
      content = content.replace(
        /exports\.default\s*=\s*((\w+);)/gi,
        (m, b, defaultExport) => {
          if (defaultExport === 'undefined') {
            return ''
          }
          if (type === 'app') {
            const vars = content.match(/\((.+?)\.default\.app\)/)[1]
            replace = `\nApp(${vars}.default.$createApp(${defaultExport}));\n`
          } else if (type === 'page') {
            const pagePath = npath
              .join(
                npath.relative(compiler.options.dir, pathParse.dir),
                pathParse.name
              )
              .replace(/\\/gi, '/')
            const vars = content.match(/\((.+?)\.default\.page\)/)[1]
            replace = `\nPage(${vars}.default.$createPage(${defaultExport} , '${pagePath}'));\n`
          } else if (type === 'component') {
            const pagePath = npath
              .join(
                npath.relative(compiler.options.dir, pathParse.dir),
                pathParse.name
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
  },
  getEntryConfigPath (compiler) {
    return `${npath.join(compiler.options.context, 'wechat.config.json')}`
  },
  getOutputConfigPath (compiler) {
    return `${npath.join(compiler.options.output, 'project.config.json')}`
  },
  getOutputPath (oriPath, compiler) {
    let distPath = oriPath.replace(
      compiler.options.dir,
      compiler.options.output
    )
    distPath = distPath.replace(
      'node_modules',
      npath.join(compiler.options.export, npath.sep, 'npm')
    )
    distPath = distPath
      .replace('.html', '.wxml')
      .replace('.css', '.wxss')
      .replace('.less', '.wxss')
      .replace('.sass', '.wxss')
      .replace('.scss', '.wxss')
      .replace('.acss', '.wxss')
      .replace('.styl', '.wxss')
    return distPath
  },
  transformHtml (
    data,
    oriPath,
    pathParse,
    distPath,
    compiler,
    compilation,
    resolve,
    reject
  ) {
    compilation.modules[distPath] = data
    resolve()
  },
  // js 包裹App() Page() Component()
  // js 处理npm hack
  // js 处理引用
  transformJs (
    data,
    oriPath,
    pathParse,
    distPath,
    compiler,
    compilation,
    type,
    resolve,
    reject
  ) {
    const requirePaths = []
    if (data) {
      const ast = parse(data)
      // 将引用的路径放入待编译池中
      traverse(ast, {
        CallExpression (astPath) {
          if (
            astPath.node &&
            astPath.node.callee &&
            astPath.node.callee.name === 'require' &&
            astPath.node.arguments &&
            astPath.node.arguments[0]
          ) {
            const requirePath = astPath.node.arguments[0].value
            if (
              requirePath[0] &&
              requirePath[0] !== '.' &&
              requirePath[0] !== '/'
            ) {
              requirePaths.push(
                compilation.getRequirePath(process.cwd(), requirePath)
              )
            } else {
              requirePaths.push(
                compilation.getRequirePath(pathParse.dir, requirePath)
              )
            }
          }
        },
      })
    }
    Promise.all(requirePaths)
      .then(paths => {
        console.log(paths)
        paths.forEach(item => {
          compilation.waitCompile[item] = null
        })
        if (/node_modules/.test(oriPath)) {
          data = this.npmCodeHack(data, oriPath)
        }
        if (type === 'app' || type === 'page' || type === 'component') {
          data = this.insHack(data, oriPath, compiler, type, pathParse)
        }
        compilation.modules[distPath] = data
        resolve()
      })
      .catch(reject)
  },
  transformStyle (
    data,
    oriPath,
    pathParse,
    distPath,
    compiler,
    compilation,
    resolve,
    reject
  ) {
    try {
      data = data.replace(/\/\*.+?\*\/|\/\/.*(?=[\n\r])/g, '')
      data.replace(/@import\s*(["'])(.+?)\1;/g, function (m, $1, $2) {
        const ext = npath.parse($2).ext
        const stylePath = compilation.resolvePath(pathParse, $2)
        compilation.waitCompile[stylePath] = null
        return m.replace(ext, '.wxss')
      })
      compilation.modules[distPath] = data
      resolve()
    } catch (err) {
      reject(err)
    }
  },
  splitConfig (config, pathParse, jsonPath, type, compilation) {
    if (config.mixins) {
      config.mixins.forEach(item => {
        const jsPath = compilation.resolvePath(pathParse, item + '.js')
        compilation.waitCompile[jsPath] = null
      })
    }
    if (config.wechatMixins) {
      config.wechatMixins.forEach(item => {
        const jsPath = compilation.resolvePath(pathParse, item + '.js')
        compilation.waitCompile[jsPath] = null
      })
    }
    if (config.usingComponents) {
      for (const key in config.usingComponents) {
        const jsPath = compilation.resolvePath(
          pathParse,
          config.usingComponents[key] + '.js'
        )
        compilation.waitCompile[jsPath] = null
      }
    }
    if (config.wechatComponents) {
      for (const key in config.wechatComponents) {
        const jsPath = compilation.resolvePath(
          pathParse,
          config.wechatComponents[key] + '.js'
        )
        compilation.waitCompile[jsPath] = null
      }
    }
    // 根据type不同转译出不同的json文件

    compilation.modules[jsonPath] = JSON.stringify(config)
  },
  mergeProjectConfig (oriPath, compiler, resolve, reject) {
    try {
      let data = fs.readFileSync(oriPath, 'utf-8') || ''
      data = (data && JSON.parse(data)) || {}
      const distConfig = JSON.parse(compiler.distConfig)
      data = JSON.stringify(Object.assign(distConfig, data))
      resolve({ data: data })
    } catch (err) {
      reject(err)
    }
  },
}
