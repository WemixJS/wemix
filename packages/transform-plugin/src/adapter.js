import fs from 'fs-extra'
import npath from 'path'
import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import generator from '@babel/generator'
import * as t from '@babel/types'
import {
  EXPORT_WECHAT,
  EXPORT_ALIPAY,
  EXPORT_TT,
  EXPORT_SWAN,
  STANDARD_ATTRIBUTE_PREFIX,
  STANDARD_ATTRIBUTE,
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

const customHack = function (data, oriPath, compiler, type, pathParse) {
  if (/node_modules/.test(oriPath)) {
    data = this.platform.npmCodeHack(data, oriPath)
  } else {
    if (/(getApp|getCurrentPages)\(\)/.test(data)) {
      compiler.logger.warn(
        oriPath + ': Use wemix.getApp() or wemix.getCurrentPages()'
      )
    }
    if (/(wx|my|tt|swan)\./.test(data)) {
      compiler.logger.warn(oriPath + ': wx|my|tt|swan replaceWith wemix')
    }
  }
  if (/^(app|page|component)$/.test(type)) {
    data = wrapPageUp(data, oriPath, compiler, type, pathParse)
  }
  data = data.replace(/([\w[\]a-d.]+)\s*instanceof Function/g, function (
    matchs,
    word
  ) {
    return ' typeof ' + word + " ==='function' "
  })
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
  const ast = parse('<CONTAINER>' + data + '</CONTAINER>', {
    sourceType: 'module',
    plugins: ['jsx'],
  })
  const _this = this
  traverse(ast, {
    JSXAttribute (astPath) {
      const node = astPath.node
      const type = node.name.type
      if (type === 'JSXNamespacedName') {
        const namespace = node.name.namespace
        if (namespace.name === STANDARD_ATTRIBUTE_PREFIX) {
          const attr = STANDARD_ATTRIBUTE_PREFIX + ':' + node.name.name.name
          for (let standardAttr in STANDARD_ATTRIBUTE) {
            if (attr === STANDARD_ATTRIBUTE[standardAttr]) {
              const newAttr = _this.platform.attribute[standardAttr].split(':')
              node.name.namespace.name = newAttr[0]
              node.name.name.name = newAttr[1]
            }
          }
        } else {
          const shortPath = oriPath.substr(oriPath.indexOf('src'))
          console.warn(
            `请勿使用原生语法: ${shortPath} line ${node.name.loc.start.line}  ${
              namespace.name
            }:${node.name.name.name}=${node.value.value}`
          )
        }
      } else if (type === 'JSXIdentifier') {
        const attr = node.name.name
        for (let standardAttr in STANDARD_ATTRIBUTE) {
          if (attr === STANDARD_ATTRIBUTE[standardAttr]) {
            const newAttr = _this.platform.attribute[standardAttr]
            node.name.name = newAttr
          }
        }
      }
    },
  })
  compilation.modules[distPath] = generator(ast).code.replace(
    /<\/?CONTAINER>;?/g,
    ''
  )
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
        const callee = astPath.get('callee')
        if (callee.isIdentifier({ name: 'require' })) {
          const args = astPath.get('arguments')[0]
          const requirePath = args.node.value
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
        const importReplace = item.astPath.get('arguments')[0]
        importReplace.replaceWith(t.stringLiteral(importDistPath))
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

const adapterCorePkg = function (compiler, data, resolve, reject) {
  const ast = parse(data, { sourceType: 'module' })
  traverse(ast, {
    ImportDeclaration (astPath) {
      const source = astPath.get('source')
      if (
        source.isStringLiteral({ value: './wechat' }) &&
        compiler.options.export !== 'wechat'
      ) {
        const replaceImport = t.importDeclaration(
          astPath.node.specifiers,
          t.stringLiteral(`./${compiler.options.export}`)
        )
        astPath.replaceWith(replaceImport)
      }
    },
  })
  resolve({ data: generator(ast).code })
}
const splitJsonConfig = function (
  configNode,
  config,
  pathParse,
  jsonPath,
  type,
  compiler,
  compilation
) {
  const adpaterConfig = {}
  if (type === 'app') {
    for (const key in this.platform.appConfig) {
      if (key === 'window') {
        if (config[key]) {
          const window = {}
          for (const skey in this.platform.appConfig[key]) {
            if (config[key][skey] !== undefined) {
              window[skey] = config[key][skey]
            }
          }
          adpaterConfig[key] = window
        }
      } else if (key === 'tabBar') {
        if (config[key]) {
          const tabBar = {}
          for (const skey in this.platform.appConfig[key]) {
            if (skey === this.platform.tabName) {
              const list = config[key][skey].map(item => {
                const tab = Object.assign(
                  {},
                  this.platform.appConfig[key][skey]
                )
                for (const tkey in tab) {
                  tab[tkey] = item[tab[tkey]]
                }
                return tab
              })
              tabBar[skey] = list
            } else {
              if (config[key][skey] !== undefined) {
                tabBar[skey] = config[key][skey]
              }
            }
          }
          adpaterConfig[key] = tabBar
        }
      } else {
        if (config[this.platform.appConfig[key]] !== undefined) {
          adpaterConfig[key] = config[this.platform.appConfig[key]]
        }
      }
    }
    if (config[`${compiler.options.export}`]) {
      for (const key in config[`${compiler.options.export}`]) {
        if (
          toString.call(config[`${compiler.options.export}`][key]) ===
          '[object Object]'
        ) {
          adpaterConfig[key] = Object.assign(
            adpaterConfig[key] || {},
            config[`${compiler.options.export}`][key] || {}
          )
        } else {
          adpaterConfig[key] = config[`${compiler.options.export}`][key]
        }
      }
    }
  }
  if (type === 'page' || type === 'component') {
    config.usingComponents = Object.assign(
      config.usingComponents || {},
      config[`${compiler.options.export}Components`] || {}
    )
    for (const key in config.usingComponents) {
      const jsPath = compilation.resolvePath(
        pathParse,
        config.usingComponents[key] + '.js'
      )
      compilation.waitCompile[jsPath] = null
    }
    for (const key in this.platform.pageConfig) {
      if (config[this.platform.pageConfig[key]] !== undefined) {
        adpaterConfig[key] = config[this.platform.pageConfig[key]]
      }
    }
  }
  if (type === 'component') {
    adpaterConfig.component = true
  }
  const configTempName = 'config'
  let strCfg = JSON.stringify(adpaterConfig).replace(/"/g, `'`)
  strCfg = `const ${configTempName} = ${strCfg};`
  const astCfg = parse(strCfg)
  traverse(astCfg, {
    VariableDeclarator (astPath) {
      const id = astPath.get('id')
      if (id.isIdentifier({ name: configTempName })) {
        configNode
          .get('right')
          .replaceWith(t.objectExpression(astPath.get('init').node.properties))
      }
    },
  })
  compilation.modules[jsonPath] = JSON.stringify(adpaterConfig)
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
  let className, componentName, configNode, propsNode
  try {
    const ast = parse(data, { sourceType: 'module' })
    traverse(ast, {
      ImportDeclaration (astPath) {
        const source = astPath.get('source')
        if (source.isStringLiteral({ value: '@wemix/core' })) {
          const specifier = astPath.get('specifiers')[0]
          const name = specifier.get('local').node.name
          traverse(ast, {
            ClassDeclaration (astPath) {
              const id = astPath.get('id')
              const superClass = astPath.get('superClass')
              const object = superClass.get('object')
              const property = superClass.get('property')
              if (
                object.isIdentifier({ name: name }) &&
                (property.isIdentifier({ name: 'app' }) ||
                  property.isIdentifier({ name: 'page' }) ||
                  property.isIdentifier({ name: 'component' }))
              ) {
                className = id.node.name
                componentName = property.node.name
              }
              traverse(ast, {
                AssignmentExpression (astPath) {
                  const left = astPath.get('left')
                  const object = left.get('object')
                  const property = left.get('property')
                  if (
                    object.isIdentifier({ name: className }) &&
                    property.isIdentifier({ name: 'config' })
                  ) {
                    configNode = astPath
                  }
                  if (
                    object.isIdentifier({ name: className }) &&
                    property.isIdentifier({ name: 'properties' })
                  ) {
                    propsNode = astPath
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
      if (configNode) {
        // eslint-disable-next-line no-new-func
        const config = new Function(
          `return ${generator(configNode.get('right').node).code}`
        )()
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
          configNode,
          config,
          pathParse,
          jsonPath,
          componentName,
          compiler,
          compilation
        )
      }
      if (propsNode) {
        // eslint-disable-next-line no-new-func
        const props = new Function(
          `return ${generator(propsNode.get('right').node).code}`
        )()
        if (Object.keys(props).length > 0) {
          this.platform.processProps(propsNode, props, compiler)
        }
      }
    }
    data = generator(ast).code
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
  adapterCorePkg (...args) {
    adapterCorePkg.call(this, ...args)
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
