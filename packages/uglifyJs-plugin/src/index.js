/*
 * @Description: uglifyJs-plugin
 * @LastEditors: sanshao
 * @Date: 2019-02-28 14:32:47
 * @LastEditTime: 2019-03-27 10:12:07
 */
import UglifyJs from 'uglify-js'
export default class UglifyJsPlugin {
  apply (compiler) {
    compiler.hooks.afterSingleCompile.tapAsync(
      'UglifyJsPlugin',
      (data, path, cb) => {
        if (!data) {
          return cb(null, data)
        }
        if (/.js$/.test(path)) {
          const result = UglifyJs.minify(data)
          if (!result.error) {
            cb(null, result.code)
          } else {
            cb(result.error)
          }
        }
      }
    )
  }
}
