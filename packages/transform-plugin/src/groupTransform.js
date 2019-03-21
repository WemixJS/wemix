import { EXPORT_WECHAT } from './constants'
import wechat from './wechat'
// matchWechatData (data, oriPath, module, compiler, compilation) {
//   return new Promise((resolve, reject) => {
//     const parseOriPath = npath.parse(oriPath)
//     switch (parseOriPath.ext) {
//       case '.js':
//         const resolver = compiler.resolverFactory.get('normal', {})
//         if (
//           !/node_modules/.test(oriPath) &&
//           (/getApp\(\)/.test(data) || /getCurrentPages\(\)/.test(data))
//         ) {
//           compiler.logger.warn(
//             ` Warnning in ${oriPath}
//               getApp() or getCurrentPages() is not allowed to use
//             `
//           )
//         }
//         const ast = parse(data)
//         const importPaths = []
//         traverse(ast, {
//           enter (path) {
//             if (
//               path.node.type === 'CallExpression' &&
//               path.node.callee.name === 'require'
//             ) {
//               const func = function (params) {
//                 const requirePath = path.node.arguments[0].value
//                 let baseDir = parseOriPath.dir
//                 if (
//                   requirePath[0] &&
//                   requirePath[0] !== '.' &&
//                   requirePath[0] !== '/'
//                 ) {
//                   baseDir = process.cwd()
//                 }
//                 return new Promise((resolve, reject) => {
//                   resolver
//                     .resolve({}, baseDir, requirePath, {})
//                     .then(absPath => {
//                       resolve({
//                         node: path.node.arguments[0],
//                         path: absPath,
//                       })
//                     })
//                     .catch(reject)
//                 })
//               }
//               importPaths.push(func())
//             }
//           },
//         })

//         Promise.all(importPaths)
//           .then(searched => {
//             let toPath
//             searched.forEach(item => {
//               if (/node_modules/.test(item.path)) {
//                 toPath = item.path.replace('node_modules', 'dist/npm')
//                 if (!compilation.modules.npm[toPath]) {
//                   compilation.waitCompile[item.path] = null
//                 }
//               } else {
//                 toPath = item.path.replace(
//                   compiler.options.entryDir,
//                   compiler.options.outputDir
//                 )
//               }
//               toPath = npath.relative(npath.dirname(module.distPath), toPath)
//               if (compiler.options.mixs.test(oriPath)) {
//                 toPath = /\.js/.test(toPath)
//                   ? toPath.replace('.js', '.wxs')
//                   : toPath + '.wxs'
//               }
//               item.node.value = toPath
//             })
//             data = generator(ast, {}, data).code
//             if (/node_modules/.test(oriPath)) {
//               data = this.npmCodeHack(oriPath, data)
//             }
//             data = this.WechatInsHack(compiler, oriPath, data, module)
//             resolve(data)
//           })
//           .catch(reject)
//         break
//       case '.less':
//         data = data && data.replace(/\.less/gi, '.wxss')
//         resolve(data)
//         break
//       default:
//         resolve(data)
//     }
//   })
// }

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
  rdata,
  oriPath,
  pathParse,
  distPath,
  compiler,
  compilation
) {
  return new Promise((resolve, reject) => {
    switch (compiler.options.export) {
      case EXPORT_WECHAT:
        resolve(data)
        break
      default:
        resolve()
        break
    }
  })
}

export const transformJs = function (
  rdata,
  oriPath,
  pathParse,
  distPath,
  compiler,
  compilation
) {
  return new Promise((resolve, reject) => {
    switch (compiler.options.export) {
      case EXPORT_WECHAT:
        wechat.transformJs(
          rdata,
          oriPath,
          pathParse,
          compiler,
          compilation,
          resolve,
          reject
        )
        break
      default:
        resolve()
        break
    }
  })
}

export const transformStyle = function (
  rdata,
  oriPath,
  pathParse,
  distPath,
  compiler,
  compilation
) {
  return new Promise((resolve, reject) => {
    switch (compiler.options.export) {
      case EXPORT_WECHAT:
        wechat.transformStyle(rdata, oriPath, compilation, resolve, reject)
        break
      default:
        resolve()
        break
    }
  })
}

export const mergeProjectConfig = function (oriPath, compiler) {
  return new Promise((resolve, reject) => {
    switch (compiler.options.export) {
      case EXPORT_WECHAT:
        wechat.mergeProjectConfig(oriPath, compiler, resolve, reject)
        break
      default:
        resolve()
        break
    }
  })
}
