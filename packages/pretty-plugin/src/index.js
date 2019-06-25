/*
 * @Description: pretty-plugin
 * @LastEditors: Please set LastEditors
 * @Date: 2019-02-28 14:32:47
 * @LastEditTime: 2019-06-25 16:04:45
 */
import { minify } from 'html-minifier'
import JSONFormatter from 'json-fmt'

export default class PrettyPlugin {
  apply (compiler) {
    compiler.hooks.emit.tapAsync('PrettyPlugin ', (compilation, cb) => {
      for (const distPath in compilation.modules) {
        const value = compilation.modules[distPath]
        if (
          /\.(wxml|ttml|axml|swan)$/.test(distPath) &&
          toString.call(value) === '[object String]'
        ) {
          const result = minify(value, {
            // maxLineLength: 100,
            collapseWhitespace: true,
            keepClosingSlash: true,
            removeEmptyAttributes: true,
            removeComments: true,
            caseSensitive: true,
          })
          if (result.error) {
            cb(result.error)
          } else {
            compilation.modules[distPath] = result
          }
        }
        if (
          /\.json$/.test(distPath) &&
          toString.call(value) === '[object String]'
        ) {
          const fmt = new JSONFormatter({
            indent: '\t',
            spaceBeforeColon: true,
          })
          const result = fmt.append(value)
          if (result.error) {
            cb(result.error)
          } else {
            compilation.modules[distPath] = result.flush()
          }
        }
      }
      cb()
    })
  }
}
