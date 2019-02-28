/*
 * @Description: Filter
 * @LastEditors: sanshao
 * @Date: 2019-02-20 16:16:38
 * @LastEditTime: 2019-02-20 16:16:54
 */

import match from 'minimatch'
import evaluate from './eval'

export default function filter (files, filters, data, done) {
  if (!filters) {
    return done()
  }
  const fileNames = Object.keys(files)

  fileNames.forEach(item => {
    if (/\.DS_Store/.test(item)) {
      delete files[item]
    }
  })
  Object.keys(filters).forEach(glob => {
    fileNames.forEach(file => {
      if (match(file, glob, { dot: true })) {
        const condition = filters[glob]
        if (!evaluate(condition, data)) {
          delete files[file]
        }
      }
    })
  })
  done()
}
