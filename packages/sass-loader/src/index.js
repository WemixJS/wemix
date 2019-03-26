/*
 * @Description: sass-loader
 * @LastEditors: sanshao
 * @Date: 2019-02-28 14:32:47
 * @LastEditTime: 2019-03-27 10:11:10
 */

export default function (data, loader, path, next) {
  if (!data) {
    return next(null, data)
  }
  next(null, data)
}
