/*
 * @Description: wemix config options
 * @LastEditors: sanshao
 * @Date: 2019-02-20 16:40:28
 * @LastEditTime: 2019-05-09 19:21:01
 */

import fs from 'fs-extra'
import npath from 'path'
import * as util from '../utils'

const DEFAULT_OPTIONS = {
  env: { type: String, default: 'production' },
  entry: { type: Array, default: ['src/app.js', 'src/assets'] },
  styleInject: { type: Object, default: {} },
  export: { type: String, default: 'wechat' },
  watch: { type: Boolean, default: false },
  loaders: { type: Array, default: [] },
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
        throw new Error(
          `Unexpected type: ${k} expect a ${defaultItem.type.name}`
        ) // eslint-disable-line
      }
      setValue(ret, k, val)
    }
  }
  return ret
}

export const convert = function (args) {
  const exitDefaultCfg = fs.existsSync(DEFAULT_CONFIG)
  const exitAppointCfg =
    args.config && fs.existsSync(npath.resolve(process.cwd(), args.config))
  if (!exitDefaultCfg && !exitAppointCfg) {
    throw new Error(`No configuration file found in the current directory.`) // eslint-disable-line
  }

  let opt
  if (exitDefaultCfg) {
    opt = require(DEFAULT_CONFIG)
  }
  if (exitAppointCfg) {
    opt = require(npath.resolve(process.cwd(), args.config))
  }

  const argOpt = parse(args, DEFAULT_OPTIONS, true)
  if (typeof args.watch === 'boolean') {
    argOpt.watch = !!args.watch
  }
  if (typeof args.progress === 'boolean') {
    argOpt.progress = !!args.progress
  }

  const config = Object.assign({}, parse(opt), argOpt)
  if (
    !config.export ||
    (config.export !== 'wechat' &&
      config.export !== 'alipay' &&
      config.export !== 'tt' &&
      config.export !== 'swan')
  ) {
    throw new Error(
      `No export type found. Add --export <wechat|alipay|tt|swan>`
    ) // eslint-disable-line
  }

  if (
    !config.env ||
    (config.env !== 'production' && config.env !== 'development')
  ) {
    throw new Error(`No env type found. Add --env <production|development>`) // eslint-disable-line
  }

  config.context = process.cwd()
  if (toString.call(config.entry) !== '[object Array]') {
    config.entry = [config.entry]
  }
  config.entry = [
    npath.join(process.cwd(), 'wemixconfig', config.export),
  ].concat(config.entry)
  config.entry = config.entry.map(item => {
    if (/app\.js/.test(item)) {
      config.dir = npath.resolve(config.context, item.replace('/app.js', ''))
    }
    return npath.resolve(config.context, item)
  })
  config.output = npath.resolve(config.context, config.export)
  if (config.loaders) {
    config.loaders.forEach(loader => {
      if (!util.isReg(loader.test)) {
        throw new Error(
          `Unexpected type: module.rules.test expect a [object RegExp]`
        ) // eslint-disable-line
      }
      if (loader.include && !util.isArray(loader.include)) {
        throw new Error(
          `Unexpected type: module.rules.include expect a [object Array]`
        ) // eslint-disable-line
      }
      if (loader.exclude && !util.isArray(loader.exclude)) {
        throw new Error(
          `Unexpected type: module.rules.exclude expect a [object Array]`
        ) // eslint-disable-line
      }
      if (!util.isArray(loader.use)) {
        throw new Error(
          `Unexpected type: module.rules.use expect a [object Array]`
        ) // eslint-disable-line
      }
    })
  }
  return config
}
