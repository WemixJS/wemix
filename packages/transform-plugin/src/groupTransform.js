import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import generator from '@babel/generator'
import fs from 'fs-extra'
import npath from 'path'
import { EXPORT_WECHAT, EXPORT_ALIPAY } from './constants'
import wechat from './wechat'
import alipay from './alipay'

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
  switch (compiler.options.export) {
    case EXPORT_WECHAT:
      wechat.transformJs(
        data,
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
    default:
      resolve(data)
      break
  }
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
  switch (compiler.options.export) {
    case EXPORT_WECHAT:
      wechat.mergeProjectConfig(oriPath, compiler, resolve, reject)
      break
    default:
      resolve()
      break
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
