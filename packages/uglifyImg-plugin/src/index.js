/*
 * @Description: uglifyImg-plugin
 * @LastEditors: sanshao
 * @Date: 2019-02-28 14:32:47
 * @LastEditTime: 2019-02-28 14:43:04
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
        if (/\.(png|jpe?g|gif|svg)(\?.*)?$/.test(path)) {
          const result = uglifyImg(npath.dirname(path), path)
          cb(null, result)
        }
      }
    )
  }
}
