import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import generator from '@babel/generator'
import fs from 'fs-extra'
import npath from 'path'
import Adapter from './adapter'

let adapter = null
export const setAdapter = function (compiler) {
  adapter = new Adapter(compiler)
}
export const getEntryConfigPath = function (compiler) {
  return adapter.getEntryConfigPath(compiler)
}
export const getOutputConfigPath = function (compiler) {
  return adapter.getOutputConfigPath(compiler)
}
export const getOutputPath = function (oriPath, compiler) {
  return adapter.getOutputPath(oriPath, compiler)
}
export const addAdapterCore = function (compiler) {
  return adapter.getCorePkg(compiler)
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
  compilation.modules[distPath] = data
  resolve()
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
      compilation.modules[distPath] = adapter.customHack(
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
  try {
    data = data.replace(/\/\*.+?\*\/|\/\/.*(?=[\n\r])/g, '')
    data = data.replace(/@import\s*(["'])(.+?)\1;/g, function (m, $1, $2) {
      const ext = npath.parse($2).ext
      const stylePath = compilation.resolvePath(pathParse, $2)
      compilation.waitCompile[stylePath] = null
      return m.replace(ext, adapter.platform.cssExt)
    })
    compilation.modules[distPath] = data
    resolve()
  } catch (err) {
    reject(err)
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
        adapter.splitConfig(
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
