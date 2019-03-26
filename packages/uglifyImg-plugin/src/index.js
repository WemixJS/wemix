/*
 * @Description: uglifyImg-plugin
 * @LastEditors: sanshao
 * @Date: 2019-02-28 14:32:47
 * @LastEditTime: 2019-03-27 10:11:49
 */
import imagemin from 'imagemin'
import imageminJpegtran from 'imagemin-jpegtran'
import imageminPngquant from 'imagemin-pngquant'
import npath from 'path'

const uglifyImg = async (path, dataPath) => {
  const result = await imagemin([dataPath], path, {
    plugins: [
      imageminJpegtran(),
      imageminPngquant({
        quality: [0.6, 0.8],
      }),
    ],
  })
  return result
}

export default class UglifyImgPlugin {
  apply (compiler) {
    compiler.hooks.beforeSingleCompile.tapAsync(
      'UglifyJsPlugin',
      (data, path, cb) => {
        if (!data) {
          return cb(null, data)
        }
        if (/\.(png|jpe?g|gif|svg)(\?.*)?$/.test(path)) {
          const result = uglifyImg(npath.dirname(path), path)
          cb(null, result)
        }
      }
    )
  }
}
