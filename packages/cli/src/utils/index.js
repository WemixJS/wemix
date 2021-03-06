/*
 * @Description: 工具方法
 * @LastEditors: sanshao
 * @Date: 2019-02-20 15:51:24
 * @LastEditTime: 2019-03-25 10:01:48
 */

import childProcess from 'child_process'
import npath from 'path'
import fs from 'fs-extra'

/**
 * @description: 格式化日期
 */
export const datetime = (date = new Date(), format = 'HH:mm:ss') => {
  let fn = d => {
    return ('0' + d).slice(-2)
  }
  if (date && typeof date === 'string') {
    date = new Date(Date.parse(date))
  }
  const formats = {
    YYYY: date.getFullYear(),
    MM: fn(date.getMonth() + 1),
    DD: fn(date.getDate()),
    HH: fn(date.getHours()),
    mm: fn(date.getMinutes()),
    ss: fn(date.getSeconds()),
  }
  return format.replace(/([a-z])\1+/gi, function (a) {
    return formats[a] || a
  })
}

/**
 * @description: 获取目录下所有文件路径列表
 */
export const getFiles = function (dir = process.cwd(), prefix = '') {
  dir = npath.normalize(dir)
  if (!fs.existsSync(dir)) {
    return []
  }
  let files = fs.readdirSync(dir)
  let rst = []
  files.forEach(item => {
    let filepath = dir + npath.sep + item
    let stat = fs.statSync(filepath)
    if (stat.isFile()) {
      if (!/^\.+/.test(item)) {
        rst.push(prefix + item)
      }
    } else if (stat.isDirectory()) {
      rst = rst.concat(
        getFiles(
          npath.normalize(dir + npath.sep + item),
          npath.normalize(prefix + item + npath.sep)
        )
      )
    }
  })
  return rst
}

/**
 * @description: 获取目录下所有文件夹路径列表
 */
export const getDirectories = function (dir = process.cwd(), prefix = '') {
  dir = npath.normalize(dir)
  if (!fs.existsSync(dir)) {
    return []
  }
  let files = fs.readdirSync(dir)
  let rst = []
  files.forEach(item => {
    let filepath = dir + npath.sep + item
    let stat = fs.statSync(filepath)
    if (stat.isDirectory()) {
      const subDirs = getDirectories(
        npath.normalize(dir + npath.sep + item),
        npath.normalize(prefix + item + npath.sep)
      )
      if (subDirs.length) {
        rst = rst.concat(subDirs)
      } else {
        rst.push(filepath)
      }
    }
  })
  return rst
}

/**
 * @description: process exec
 */
export const exec = function (cmd, quite) {
  return new Promise((resolve, reject) => {
    let fcmd = childProcess.exec(cmd, (err, stdout, stderr) => {
      if (err) {
        reject(err)
      } else {
        resolve(stdout, stderr)
      }
    })
    fcmd.stdout.on('data', chunk => {
      !quite && process.stdout.write(chunk)
    })
    fcmd.stderr.on('data', chunk => {
      !quite && process.stdout.write(chunk)
    })
  })
}

/**
 * undefined type check
 */
export const isUndef = v => v === undefined

export const isTrue = v => v === true

export const isFalse = v => v === false
/**
 * Function type check
 */
export const isFunc = v => typeof v === 'function'

/**
 * Strict object type check. Only returns true
 * for plain JavaScript objects.
 */
const _toString = Object.prototype.toString
export const isObject = obj => {
  return _toString.call(obj) === '[object Object]'
}
export const isString = obj => {
  return _toString.call(obj) === '[object String]'
}

export const isNumber = obj => {
  return _toString.call(obj) === '[object Number]'
}
export const isBoolean = obj => {
  return _toString.call(obj) === '[object Boolean]'
}
export const isArray = obj => {
  return _toString.call(obj) === '[object Array]'
}

export const isReg = obj => {
  return _toString.call(obj) === '[object RegExp]'
}
