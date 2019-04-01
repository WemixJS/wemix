import fs from 'fs-extra'
import npath from 'path'
import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import generator from '@babel/generator'
import {
  EXPORT_WECHAT,
  EXPORT_ALIPAY,
  EXPORT_TT,
  EXPORT_SWAN,
} from './constants'
import wechat from './wechatAdapter'
import alipay from './alipayAdapter'
import tt from './ttAdapter'
import swan from './swanAdapter'

const wrapPageUp = function (content, oriPath, compiler, type, pathParse) {
  if (/^(app|page|component)$/.test(type)) {
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
  return content
}

const npmCodeHack = function (content, filePath) {
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
  if (content.replace(/\s\r\n/g, '').length <= 0) {
    content = '// Empty file'
  }
  return content
}

const customHack = function (data, oriPath, compiler, type, pathParse) {
  if (/node_modules/.test(oriPath)) {
    data = npmCodeHack(data, oriPath)
  }
  if (/^(app|page|component)$/.test(type)) {
    data = wrapPageUp(data, oriPath, compiler, type, pathParse)
    data = this.platform.customHack(data)
  }
  return data
}

const getOutputPath = function (oriPath, compiler) {
  return oriPath
    .replace(compiler.options.dir, compiler.options.output)
    .replace(
      'node_modules',
      npath.join(compiler.options.export, npath.sep, 'npm')
    )
    .replace('.html', this.platform.htmlExt)
    .replace(/\.(css|less|sass|scss|acss|styl)/, this.platform.cssExt)
}

const mergeProjectConfig = function (oriPath, compiler, resolve, reject) {
  try {
    let data = fs.readFileSync(oriPath, 'utf8') || ''
    data = (data && JSON.parse(data)) || {}
    const distConfig = JSON.parse(compiler.distConfig)
    data = JSON.stringify(Object.assign(distConfig, data))
    resolve({ data: data })
  } catch (err) {
    reject(err)
  }
}

const transformHtml = function (
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
}
const transformJs = function (
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
  let ast
  if (data) {
    ast = parse(data)
    // 将引用的路径放入待编译池中
    traverse(ast, {
      CallExpression (astPath) {
        const node = astPath.node
        const callee = astPath.get('callee')
        if (callee.isIdentifier({ name: 'require' })) {
          const requirePath = node.arguments[0].value
          const p = requirePath[0]
          if (p && p !== '.' && p !== '/') {
            requirePaths.push(
              compilation.getRequirePath(process.cwd(), requirePath, astPath)
            )
          } else {
            requirePaths.push(
              compilation.getRequirePath(pathParse.dir, requirePath, astPath)
            )
          }
        }
      },
    })
  }
  Promise.all(requirePaths)
    .then(paths => {
      paths.forEach(item => {
        let importDistPath = item.absPath.replace(
          'node_modules',
          npath.join(compiler.options.export, npath.sep, 'npm')
        )
        const relative = npath.relative(
          npath.dirname(distPath),
          compiler.options.output
        )
        if (relative) {
          importDistPath =
            relative + importDistPath.replace(compiler.options.output, '')
        } else {
          importDistPath =
            '.' + importDistPath.replace(compiler.options.output, '')
        }
        item.astPath.node.arguments[0].value = importDistPath
        compilation.waitCompile[item.absPath] = null
      })
      data = generator(ast).code
      compilation.modules[distPath] = customHack.call(
        this,
        data,
        oriPath,
        compiler,
        type,
        pathParse
      )
      resolve()
    })
    .catch(reject)
}
const transformStyle = function (
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
    data = data.replace(/@import\s*(["'])(.+?)\1;/g, (m, $1, $2) => {
      const ext = npath.parse($2).ext
      const stylePath = compilation.resolvePath(pathParse, $2)
      compilation.waitCompile[stylePath] = null
      return m.replace(ext, this.platform.cssExt)
    })
    compilation.modules[distPath] = data
    resolve()
  } catch (err) {
    reject(err)
  }
}
const splitJsonConfig = function (...args) {
  this.platform.splitJsonConfig(...args)
}
const splitConfig = function (
  data,
  oriPath,
  pathParse,
  distPath,
  compiler,
  compilation,
  resolve,
  reject
) {
  let className, componentName, config
  try {
    const ast = parse(data, { sourceType: 'module' })
    traverse(ast, {
      ImportDeclaration (astPath) {
        const node = astPath.node
        const source = node.source
        let value = source.value
        const specifiers = node.specifiers
        if (value === '@wemix/core' && specifiers[0] && specifiers[0].local) {
          const name = specifiers[0].local.name
          traverse(ast, {
            ClassDeclaration (astPath) {
              const superClass = astPath.node.superClass
              const propertyName = superClass.property.name
              if (
                superClass &&
                superClass.object &&
                superClass.object.name === name &&
                (propertyName === 'app' ||
                  propertyName === 'page' ||
                  propertyName === 'component')
              ) {
              }
              className = astPath.node.id.name
              componentName = propertyName
              traverse(ast, {
                AssignmentExpression (astPath) {
                  const leftObject = astPath.node.left.object
                  const leftProp = astPath.node.left.property
                  if (
                    leftObject &&
                    leftObject.name === className &&
                    leftProp &&
                    leftProp.name === 'config'
                  ) {
                    // eslint-disable-next-line no-new-func
                    config = new Function(
                      `return ${generator(astPath.node.right).code}`
                    )()
                  }
                },
              })
            },
          })
        }
      },
    })
    if (className && componentName) {
      let styleExt = ''
      let nearPath = npath.join(pathParse.dir, npath.sep, pathParse.name)
      if (fs.existsSync(nearPath + '.less')) {
        styleExt = '.less'
      } else if (fs.existsSync(nearPath + '.scss')) {
        styleExt = '.scss'
      } else if (fs.existsSync(nearPath + '.sass')) {
        styleExt = '.sass'
      } else if (fs.existsSync(nearPath + '.css')) {
        styleExt = '.css'
      } else if (fs.existsSync(nearPath + '.acss')) {
        styleExt = '.acss'
      } else if (fs.existsSync(nearPath + '.styl')) {
        styleExt = '.styl'
      }
      if (componentName === 'app') {
        if (styleExt) {
          compilation.waitCompile[nearPath + styleExt] = null
        }
      }
      if (componentName === 'page' || componentName === 'component') {
        if (styleExt) {
          compilation.waitCompile[nearPath + styleExt] = null
        }
        if (fs.existsSync(nearPath + '.html')) {
          compilation.waitCompile[nearPath + '.html'] = null
        }
      }
      if (config) {
        if (config.pages) {
          let pages = compilation.getPages(config.pages)
          pages = compilation.getSubPackages(pages, config.subpackages)
          // 将pages的路径放入待编译池中 只需放js
          pages.forEach(item => {
            const pageJSPath = npath.join(
              compiler.options.dir,
              npath.sep,
              item + '.js'
            )
            compilation.waitCompile[pageJSPath] = null
          })
        }
        const jsonPath = distPath.replace('.js', '.json')
        splitJsonConfig.call(
          this,
          config,
          pathParse,
          jsonPath,
          componentName,
          compilation
        )
      }
    }
    resolve({ data: data, type: componentName })
  } catch (err) {
    reject(err)
  }
}

export default class Adapter {
  constructor (compiler) {
    switch (compiler.options.export) {
      case EXPORT_WECHAT:
        this.platform = wechat
        break
      case EXPORT_ALIPAY:
        this.platform = alipay
        break
      case EXPORT_TT:
        this.platform = tt
        break
      case EXPORT_SWAN:
        this.platform = swan
        break
    }
  }
  getCorePkg () {
    return this.platform.getCorePkg()
  }
  getEntryConfigPath (compiler) {
    return this.platform.getEntryConfigPath(compiler)
  }
  getOutputConfigPath (compiler) {
    return this.platform.getOutputConfigPath(compiler)
  }
  getOutputPath (...args) {
    return getOutputPath.call(this, ...args)
  }
  mergeProjectConfig (...args) {
    mergeProjectConfig.call(this, ...args)
  }
  transformHtml (...args) {
    transformHtml.call(this, ...args)
  }
  transformJs (...args) {
    transformJs.call(this, ...args)
  }
  transformStyle (...args) {
    transformStyle.call(this, ...args)
  }
  splitConfig (...args) {
    splitConfig.call(this, ...args)
  }
}
