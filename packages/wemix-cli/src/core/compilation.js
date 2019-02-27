/*
 * @Description: Compilation
 * @LastEditors: sanshao
 * @Date: 2019-02-20 19:00:43
 * @LastEditTime: 2019-02-27 09:59:59
 */
import npath from 'path'
import { getFiles } from '../utils'

export default class Compilation {
  constructor (compiler, modifiedFiles) {
    if (modifiedFiles && modifiedFiles.length) {
      const waitCompile = {}
      modifiedFiles.forEach(item => {
        waitCompile[item] = null
      })
      this.waitCompile = waitCompile
    } else {
      const files = getFiles(compiler.options.entryDir)
      const waitCompile = {}
      files.forEach(item => {
        waitCompile[npath.join(compiler.options.entryDir, item)] = null
      })
      this.waitCompile = waitCompile
    }
    this.compiler = compiler
    this.modules = {}
  }
}
