/*
 * @Description: Compilation
 * @LastEditors: sanshao
 * @Date: 2019-02-20 19:00:43
 * @LastEditTime: 2019-02-21 11:44:24
 */

export default class Compilation {
  constructor (compiler, map) {
    this.compiler = compiler
    this.modules = {}
    this.waitCompile = map
    this.writed = false
  }
}
