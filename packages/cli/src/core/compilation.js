/*
 * @Description: Compilation
 * @LastEditors: sanshao
 * @Date: 2019-02-20 19:00:43
 * @LastEditTime: 2019-03-12 15:19:10
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
