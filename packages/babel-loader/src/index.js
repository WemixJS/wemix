/*
 * @Description: babel-loader
 * @LastEditors: sanshao
 * @Date: 2019-02-28 14:32:47
 * @LastEditTime: 2019-03-12 14:17:13
 */

import { transformSync, loadPartialConfig } from '@babel/core'
import loaderUtils from 'loader-utils'
import npath from 'path'

// 编译
function _compile (data, config, path, next) {
  let loaderOptions =
    (config.options && loaderUtils.getOptions({ query: config.options })) || {}

  // 支持sourceMap
  if (
    Object.prototype.hasOwnProperty.call(loaderOptions, 'sourceMap') &&
    !Object.prototype.hasOwnProperty.call(loaderOptions, 'sourceMaps')
  ) {
    loaderOptions = Object.assign({}, loaderOptions, {
      sourceMaps: loaderOptions.sourceMap,
    })
    delete loaderOptions.sourceMap
  }

  const programmaticOptions = Object.assign({}, loaderOptions, {
    filename: path,
    sourceMaps:
      loaderOptions.sourceMaps === undefined
        ? config.options.sourceMap
        : loaderOptions.sourceMaps,
    sourceFileName: path,
  })

  const cfg = loadPartialConfig(programmaticOptions)
  if (config) {
    config.options = cfg.options
  }
  const result = transformSync(data, config.options)
  return result
}

function _type (path) {
  return Object.prototype.toString.call(path)
}

function _dealPath (path) {
  return npath.resolve(process.cwd(), path)
}

export default function (data, config, path, next) {
  const includeType = _type(config.include)
  const excludeType = _type(config.exclude)
  let [result, include, exclude, exitInclude, exitExclude] = [
    {},
    [],
    [],
    false,
    false,
  ]
  if (config.include && includeType !== '[object Array]') {
    include.push(config.include)
  } else {
    include = config.include || []
  }

  if (config.exclude && excludeType !== '[object Array]') {
    exclude.push(config.exclude)
  } else {
    exclude = config.exclude || []
  }

  for (let i = 0; i < include.length; i++) {
    if (_type(include[i]) === '[object RegExp]') {
      if (config.include.test(path)) {
        exitInclude = true
        break
      }
    } else {
      if (~_dealPath(include[i]).indexOf(path)) {
        exitInclude = true
        break
      }
    }
  }

  if (exitInclude) {
    result = _compile(data, config, path, next)
    if (result) {
      return next(null, result.code)
    }
  }

  for (let i = 0; i < exclude.length; i++) {
    if (_type(exclude[i]) === '[object RegExp]') {
      if (config.exclude.test(path)) {
        exitExclude = true
        break
      }
    } else {
      if (~_dealPath(exclude[i]).indexOf(path)) {
        exitExclude = true
        break
      }
    }
  }

  if (!exitExclude && !exitInclude) {
    result = _compile(data, config, path, next)
    if (result) {
      return next(null, result.code)
    }
  }
  next(null, data)
}
