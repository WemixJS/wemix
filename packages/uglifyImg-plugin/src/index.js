/*
 * @Description: uglifyImg-plugin
 * @LastEditors: sanshao
 * @Date: 2019-02-28 14:32:47
 * @LastEditTime: 2019-03-27 18:02:36
 */
import imagemin from 'imagemin'
import imageminJpegtran from 'imagemin-jpegtran'
import imageminPngquant from 'imagemin-pngquant'
import npath from 'path'

const uglifyImg = async (distPath, path, dir) => {
  const result = await imagemin([dir], path, {
    plugins: [
      imageminJpegtran(),
      imageminPngquant({
        quality: [0.6, 0.8],
      }),
    ],
  })
  return {
    result,
    distPath,
  }
}

export default class UglifyImgPlugin {
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
            uglifyImg(distPath, npath.dirname(value.path), value.path)
          )
        }
      }
      Promise.all(waitCompiles)
        .then(res => {
          res.forEach(item => {
            compilation.modules[item.distPath] = item.result
          })
          cb()
        })
        .catch(err => {
          cb(err)
        })
    })
  }
}
