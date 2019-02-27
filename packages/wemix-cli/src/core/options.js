/*
 * @Description: wemix config options
 * @LastEditors: sanshao
 * @Date: 2019-02-20 16:40:28
 * @LastEditTime: 2019-02-26 17:00:32
 */

import fs from 'fs-extra'
import npath from 'path'
import * as util from '../utils'

const DEFAULT_OPTIONS = {
  entryDir: { type: String, default: 'src' },
  outputDir: { type: String, default: 'dist' },
  watch: { type: Boolean, default: false },
  resolve: { type: Object, default: {} },
  module: { type: Object },
  plugins: { type: Array, default: [] },
}

const DEFAULT_CONFIG = npath.resolve('wemix.config.js')

function check (t, val) {
  if (Array.isArray(t)) {
    return t.some(type => check(type, val))
  }
  switch (t) {
    case String:
      return util.isString(val)
    case Number:
      return util.isNumber(val)
    case Boolean:
      return util.isBoolean(val)
    case Function:
      return util.isFunc(val)
    case Object:
      return util.isObject(val)
    case Array:
      return util.isArray(val)
    default:
      return val instanceof t
  }
}

export const setValue = function (obj, key, val) {
  let arr = key.split('.')
  let left = obj
  for (let i = 0, l = arr.length; i < l; i++) {
    if (i === l - 1) {
      left[arr[i]] = val
    } else {
      if (typeof left[arr[i]] !== 'object') {
        left[arr[i]] = {}
      }
      left = left[arr[i]]
    }
  }
  return obj
}

export const getValue = function (obj, key) {
  let arr = key.split('.')
  let left = obj
  let rst
  for (let i = 0, l = arr.length; i < l; i++) {
    if (i === l - 1) {
      rst = left[arr[i]]
    } else {
      if (typeof left[arr[i]] === 'undefined') {
        break
      }
      left = left[arr[i]]
    }
  }
  return rst
}

export const parse = function (
  opt = {},
  baseOpt = DEFAULT_OPTIONS,
  fromCommandLine
) {
  let ret = {}
  for (let k in baseOpt) {
    let defaultItem = baseOpt[k]
    let val = getValue(opt, k)

    if (val === undefined) {
      if (defaultItem.default !== undefined && !fromCommandLine) {
        setValue(ret, k, defaultItem.default)
      }
    } else {
      if (!check(defaultItem.type, val)) {
        throw `Unexpected type: ${k} expect a ${defaultItem.type.name}` // eslint-disable-line
      }
      setValue(ret, k, val)
    }
  }
  return ret
}

export const convert = function (args) {
  const exitDefaultCfg = fs.existsSync(DEFAULT_CONFIG)
  const exitAppointCfg = fs.existsSync(npath.join(process.cwd(), args.config))
  if (!exitDefaultCfg && !exitAppointCfg) {
    throw `No configuration file found in the current directory.` // eslint-disable-line
  }

  let opt
  if (exitDefaultCfg) {
    opt = require(DEFAULT_CONFIG)
  }
  if (exitAppointCfg) {
    opt = require(npath.join(process.cwd(), args.config))
  }

  const argOpt = parse(args, DEFAULT_OPTIONS, true)
  if (typeof args.watch === 'boolean') {
    argOpt.watch = !!args.watch
  }

  const config = Object.assign({}, parse(opt), argOpt)

  config.context = process.cwd()
  config.entryDir = npath.resolve(config.context, config.entryDir)
  config.outputDir = npath.resolve(config.context, config.outputDir)
  if (config.module && config.rules) {
    config.rules.forEach(rule => {
      if (!util.isReg(rule.test)) {
        throw `Unexpected type: module.rules.test expect a [object RegExp]` // eslint-disable-line
      }
      if (rule.include && !util.isArray(rule.include)) {
        throw `Unexpected type: module.rules.include expect a [object Array]` // eslint-disable-line
      }
      if (rule.exclude && !util.isArray(rule.exclude)) {
        throw `Unexpected type: module.rules.exclude expect a [object Array]` // eslint-disable-line
      }
      if (!util.isArray(rule.use)) {
        throw `Unexpected type: module.rules.use expect a [object Array]` // eslint-disable-line
      }
    })
  }
  return config
}
