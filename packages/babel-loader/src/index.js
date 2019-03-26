/*
 * @Description: babel-loader
 * @LastEditors: sanshao
 * @Date: 2019-02-28 14:32:47
 * @LastEditTime: 2019-03-27 10:17:45
 */

import { transformSync, loadPartialConfig } from '@babel/core'
import loaderUtils from 'loader-utils'
import npath from 'path'

// 编译
function _compile (data, loader, path, next) {
  let loaderOptions =
    (loader.options && loaderUtils.getOptions({ query: loader.options })) || {}
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
        ? loader.options && loader.options.sourceMap
        : loaderOptions.sourceMaps,
    sourceFileName: path,
  })

  const cfg = loadPartialConfig(programmaticOptions)
  if (loader) {
    loader.options = cfg.options
  }
  const result = transformSync(data, loader.options)
  return result
}

function _type (path) {
  return Object.prototype.toString.call(path)
}

function _dealPath (path) {
  return npath.resolve(process.cwd(), path)
}

export default function (data, loader, path, next) {
  if (!data) {
    return next(null, data)
  }
  const includeType = _type(loader.include)
  const excludeType = _type(loader.exclude)
  let [result, include, exclude, exitInclude, exitExclude] = [
    {},
    [],
    [],
    false,
    false,
  ]
  if (loader.include && includeType !== '[object Array]') {
    include.push(loader.include)
  } else {
    include = loader.include || []
  }

  if (loader.exclude && excludeType !== '[object Array]') {
    exclude.push(loader.exclude)
  } else {
    exclude = loader.exclude || []
  }

  for (let i = 0; i < include.length; i++) {
    if (_type(include[i]) === '[object RegExp]') {
      if (loader.include.test(path)) {
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
    result = _compile(data, loader, path, next)
    if (result) {
      return next(null, result.code)
    }
  }

  for (let i = 0; i < exclude.length; i++) {
    if (_type(exclude[i]) === '[object RegExp]') {
      if (loader.exclude.test(path)) {
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
    result = _compile(data, loader, path, next)
    if (result) {
      return next(null, result.code)
    }
  }
  next(null, data)
}
