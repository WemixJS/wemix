import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import generator from '@babel/generator'
import fs from 'fs-extra'
import npath from 'path'
import {
  EXPORT_WECHAT,
  EXPORT_ALIPAY,
  EXPORT_TT,
  EXPORT_SWAN,
} from './constants'
import wechat from './wechat'
import alipay from './alipay'

const insHack = (content, oriPath, compiler, type, pathParse) => {
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
  return content
}

export const addAdapterCore = function (compiler) {
  switch (compiler.options.export) {
    case EXPORT_WECHAT:
      return `require('./wechat')`
    case EXPORT_ALIPAY:
      return `require('./alipay')`
    case EXPORT_TT:
      return `require('./tt')`
    case EXPORT_SWAN:
      return `require('./swan')`
  }
}

export const getEntryConfigPath = function (compiler) {
  switch (compiler.options.export) {
    case EXPORT_WECHAT:
      return wechat.getEntryConfigPath(compiler)
    default:
      break
  }
}
export const getOutputConfigPath = function (compiler) {
  switch (compiler.options.export) {
    case EXPORT_WECHAT:
      return wechat.getOutputConfigPath(compiler)
    default:
      break
  }
}

export const getOutputPath = function (oriPath, compiler) {
  switch (compiler.options.export) {
    case EXPORT_WECHAT:
      return wechat.getOutputPath(oriPath, compiler)
      break
    default:
      break
  }
}

export const transformHtml = function (
  data,
  oriPath,
  pathParse,
  distPath,
  compiler,
  compilation,
  resolve,
  reject
) {
  switch (compiler.options.export) {
    case EXPORT_WECHAT:
      wechat.transformHtml(
        data,
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
      resolve(data)
      break
  }
}

// js 包裹App() Page() Component()
// js 处理npm hack
// js 处理引用
export const transformJs = function (
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
      switch (compiler.options.export) {
        case EXPORT_WECHAT:
          if (/node_modules/.test(oriPath)) {
            data = wechat.npmCodeHack(data, oriPath)
          }
          if (type === 'app' || type === 'page' || type === 'component') {
            data = insHack(data, oriPath, compiler, type, pathParse)
            data = wechat.insHack(data)
          }
          break
        case EXPORT_ALIPAY:
          if (/node_modules/.test(oriPath)) {
            data = wechat.npmCodeHack(data, oriPath)
            data = alipay.npmCodeHack(data, oriPath)
          }
          if (type === 'app' || type === 'page' || type === 'component') {
            data = insHack(data, oriPath, compiler, type, pathParse)
          }
      }
      compilation.modules[distPath] = data
      resolve()
    })
    .catch(reject)
}

export const transformStyle = function (
  data,
  oriPath,
  pathParse,
  distPath,
  compiler,
  compilation,
  resolve,
  reject
) {
  switch (compiler.options.export) {
    case EXPORT_WECHAT:
      wechat.transformStyle(
        data,
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
      resolve(data)
      break
  }
}

export const mergeProjectConfig = function (oriPath, compiler, resolve, reject) {
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

// js 处理config到json文件
// js app component page 找对应的html less
// js app pages subpackages
export const splitConfig = function (
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
        if (
          astPath.node &&
          astPath.node.source &&
          astPath.node.source.value === '@wemix/core' &&
          astPath.node.specifiers &&
          astPath.node.specifiers[0] &&
          astPath.node.specifiers[0].local
        ) {
          const name = astPath.node.specifiers[0].local.name
          traverse(ast, {
            ClassDeclaration (astPath) {
              if (
                astPath.node &&
                astPath.node.superClass &&
                astPath.node.superClass.object &&
                astPath.node.superClass.object.name === name &&
                (astPath.node.superClass.property.name === 'app' ||
                  astPath.node.superClass.property.name === 'page' ||
                  astPath.node.superClass.property.name === 'component')
              ) {
              }
              className = astPath.node.id.name
              componentName = astPath.node.superClass.property.name
              traverse(ast, {
                AssignmentExpression (astPath) {
                  if (
                    astPath.node &&
                    astPath.node.left &&
                    astPath.node.left.object &&
                    astPath.node.left.object.name === className &&
                    astPath.node.left.property &&
                    astPath.node.left.property.name === 'config'
                  ) {
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
        switch (compiler.options.export) {
          case EXPORT_WECHAT:
            wechat.splitConfig(
              config,
              pathParse,
              jsonPath,
              componentName,
              compilation
            )
            break
          default:
            break
        }
      }
    }
    resolve({ data: data, type: componentName })
  } catch (err) {
    reject(err)
  }
}
