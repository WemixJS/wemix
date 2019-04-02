/*
 * @Description: sass-loader
 * @LastEditors: sanshao
 * @Date: 2019-02-28 14:32:47
 * @LastEditTime: 2019-03-27 10:11:10
 */

import sass from 'sass'
import node_sass from 'node-sass'
import async from 'neo-async'
import semver from 'semver'
import process from 'process'
import npath from 'path'

let nodeSassJobQueue = null

export default function (data, loader, path, next) {
  console.log(2222222)
  // 获取sass包
  // function getDefaultSassImpl () {
  //   let sassImplPkg = 'node-sass'

  //   try {
  //     require.resolve('node-sass')
  //   } catch (error) {
  //     try {
  //       require.resolve('sass')
  //       sassImplPkg = 'sass'
  //     } catch (ignoreError) {
  //       sassImplPkg = 'node-sass'
  //     }
  //   }

  //   return require(sassImplPkg)
  // }

  // // 创建编译工具
  // const render = getRenderFuncFromSassImpl(getDefaultSassImpl())

  // // 判断版本
  // function getRenderFuncFromSassImpl (module) {
  //   const { info } = module
  //   const components = info.split('\t')

  //   if (components.length < 2) {
  //     next(`Unknown Sass implementation "${info}".`)
  //   }

  //   const [implementation, version] = components

  //   if (!semver.valid(version)) {
  //     next(`Invalid Sass version "${version}".`)
  //   }

  //   if (implementation === 'dart-sass') {
  //     if (!semver.satisfies(version, '^1.3.0')) {
  //       next(`Dart Sass version ${version} is incompatible with ^1.3.0.`)
  //     }
  //     return module.render.bind(module)
  //   } else if (implementation === 'node-sass') {
  //     if (!semver.satisfies(version, '^4.0.0')) {
  //       next(`Node Sass version ${version} is incompatible with ^4.0.0.`)
  //     }
  //     if (nodeSassJobQueue === null) {
  //       const threadPoolSize = Number(process.env.UV_THREADPOOL_SIZE || 4)

  //       nodeSassJobQueue = async.queue(
  //         module.render.bind(module),
  //         threadPoolSize - 1
  //       )
  //     }

  //     return nodeSassJobQueue.push.bind(nodeSassJobQueue)
  //   }
  //   next(`Unknown Sass implementation "${implementation}".`)
  // }

  // console.log('object')

  // if (data) {
  //   render(loader.options, (err, result) => {
  //     if (!err) {
  //       if (result.map && result.map !== '{}') {
  //         result.map = JSON.parse(result.map)
  //         delete result.map.file
  //         result.map.sources[0] = npath.relative(process.cwd(), path)
  //         result.map.sourceRoot = path.normalize(result.map.sourceRoot)
  //         result.map.sources = result.map.sources.map(path.normalize)
  //       } else {
  //         result.map = null
  //       }
  //       next(null, result.css.toString())
  //     } else {
  //       next(err)
  //     }
  //   })
  //   return next(null, data)
  // }
  next(null, data)
}
