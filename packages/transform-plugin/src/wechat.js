import npath from 'path'
import fs from 'fs-extra'
import htmlparser from 'htmlparser2'
import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import generator from '@babel/generator'
import * as t from '@babel/types'
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
    distPath = distPath.replace('node_modules', 'dist/npm')
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
  transformHtml () {},
  // js 处理config到json文件
  // js app component page 找对应的html less
  // js 处理引用
  // js 包裹App() Page() Component()
  // js 处理npm hack
  transformJs (
    data,
    oriPath,
    pathParse,
    compiler,
    compilation,
    resolve,
    reject
  ) {
    try {
      const ast = parse(data)
      console.log(oriPath)
      console.log(JSON.stringify(ast))
      traverse(ast, {})
      data = generator(ast).code
      if (/node_modules/.test(oriPath)) {
        data = this.npmCodeHack(data, oriPath)
      }
      data = this.insHack(data, oriPath, compiler, type, pathParse)
      resolve(data)
    } catch (err) {
      reject(err)
    }
  },
  transformStyle (rdata, oriPath, compilation, resolve, reject) {
    try {
      rdata = rdata.replace(/\/\*.+?\*\/|\/\/.*(?=[\n\r])/g, '')
      rdata.replace(/@import (["'])(.+?)\1;/g, function (m, $1, $2) {
        const ext = npath.parse($2).ext
        const stylePath = npath.resolve(oriPath, $2)
        compilation.waitCompile[stylePath] = null
        return m.replace(ext, '.wxss')
      })
      resolve(rdata)
    } catch (err) {
      reject(err)
    }
  },
  mergeProjectConfig (oriPath, compiler, resolve, reject) {
    try {
      let data = fs.readFileSync(oriPath, 'utf-8') || ''
      data = (data && JSON.parse(data)) || {}
      const distConfig = JSON.parse(compiler.distConfig)
      data = JSON.stringify(Object.assign(distConfig, data))
      resolve(data)
    } catch (err) {
      reject(err)
    }
  },
}
