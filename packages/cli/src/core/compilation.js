/*
 * @Description: Compilation
 * @LastEditors: sanshao
 * @Date: 2019-02-20 19:00:43
 * @LastEditTime: 2019-03-11 19:21:11
 */
import npath from 'path'
import fs from 'fs'
import { getFiles } from '../utils'

export default class Compilation {
  constructor (compiler, modifiedFiles) {
    if (!modifiedFiles || modifiedFiles.length === 0) {
      const configPath = `${npath.join(
        compiler.options.context,
        'wechat.config.json'
      )}`
      const files = getFiles(compiler.options.entryDir)
      modifiedFiles = files.map(item => {
        return npath.join(compiler.options.entryDir, item)
      })
      modifiedFiles.push(configPath)
    }
    this.waitCompile = {}
    modifiedFiles.forEach(item => {
      this.waitCompile[item] = null
    })
    this.compiler = compiler
    this.modules = {
      normal: {},
      npm: {},
    }
  }
  grabConfigFromScript (str, n) {
    let stash = []
    let rst = ''
    for (let i = n, l = str.length; i < l; i++) {
      if (str[i] === '{') {
        stash.push('{')
      }
      if (str[i] === '}') {
        stash.pop()
        if (stash.length === 0) {
          rst += '}'
          break
        }
      }
      if (stash.length) {
        rst += str[i]
      }
    }
    return rst
  }
  modifiedFileMTime (file) {
    const mtime = +fs.statSync(file).mtime
    if (this.compiler.cache[file] !== mtime) {
      this.compiler.cache[file] = mtime
      return true
    } else {
      return false
    }
  }
}
