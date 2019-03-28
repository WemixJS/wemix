/*
 * @Description: uglifyImg-plugin
 * @LastEditors: sanshao
 * @Date: 2019-02-28 14:32:47
 * @LastEditTime: 2019-03-28 10:36:15
 */
import imagemin from 'imagemin'
import npath from 'path'

const uglifyImg = async (path, dir, options, distPath) => {
  const result = await imagemin([path], dir, options)
  return {
    code: result[0].data,
    distPath,
  }
}

export default class UglifyImgPlugin {
  constructor (options) {
    this.options = options
  }
  apply (compiler) {
    compiler.hooks.emit.tapAsync('UglifyImgPlugin', (compilation, cb) => {
      const waitCompiles = []
      for (const distPath in compilation.modules) {
        const value = compilation.modules[distPath]
        if (
          /\.(png|jpe?g|gif|svg)(\?.*)?$/.test(distPath) &&
          toString.call(value) === '[object Object]'
        ) {
          waitCompiles.push(
            uglifyImg(
              value.path,
              npath.dirname(distPath),
              this.options,
              distPath
            )
          )
        }
      }
      Promise.all(waitCompiles)
        .then(res => {
          res.forEach(item => {
            compilation.modules[item.distPath] = item.code
          })
          cb()
        })
        .catch(err => {
          cb(err)
        })
    })
  }
}
