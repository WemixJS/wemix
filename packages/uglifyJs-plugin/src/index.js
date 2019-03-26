/*
 * @Description: uglifyJs-plugin
 * @LastEditors: sanshao
 * @Date: 2019-02-28 14:32:47
 * @LastEditTime: 2019-02-28 14:42:56
 */
import UglifyJs from 'uglify-js'
export default class UglifyJsPlugin {
  apply (compiler) {
    compiler.hooks.afterSingleCompile.tapAsync(
      'UglifyJsPlugin',
      (data, path, cb) => {
        if (/.js$/.test(path)) {
          const result = UglifyJs.minify(data)
          if (!result.error) {
            cb(null, result.code)
          } else {
            cb(result.error, null)
          }
        }
      }
    )
  }
}
