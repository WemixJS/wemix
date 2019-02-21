/*
 * @Description: Single Entry Plugin
 * @LastEditors: sanshao
 * @Date: 2019-02-21 11:53:12
 * @LastEditTime: 2019-02-21 16:13:03
 */

export default class SingleEntryPlugin {
  apply (compiler) {
    compiler.hooks.run.tapAsync(
      'SingleEntryPlugin',
      (compilation, callback) => {
        callback()
      }
    )
  }
}
