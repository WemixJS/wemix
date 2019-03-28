/*
 * @Description: uglifyJs-plugin
 * @LastEditors: sanshao
 * @Date: 2019-02-28 14:32:47
 * @LastEditTime: 2019-03-28 09:37:55
 */
import UglifyJs from 'uglify-js'
export default class UglifyJsPlugin {
  constructor (options) {
    this.options = options
  }
  apply (compiler) {
    compiler.hooks.emit.tapAsync('UglifyJsPlugin', (compilation, cb) => {
      for (const distPath in compilation.modules) {
        const value = compilation.modules[distPath]
        if (
          /\.js$/.test(distPath) &&
          toString.call(value) === '[object String]'
        ) {
          const result = UglifyJs.minify(value, this.options)
          if (result.error) {
            cb(result.error)
          } else {
            compilation.modules[distPath] = result.code
          }
        }
      }
      cb()
    })
  }
}
