/*
 * @Description: less-loader
 * @LastEditors: sanshao
 * @Date: 2019-02-28 14:32:47
 * @LastEditTime: 2019-03-12 10:37:34
 */

import less from 'less'
import chalk from 'chalk'
import loaderUtils from 'loader-utils'

export default function (data, config, path, next) {
  const loaderOptions =
    (config.options && loaderUtils.getOptions({ query: config.options })) || {}

  if (Object.prototype.hasOwnProperty.call(loaderOptions, 'path')) {
    delete config.options.path
    console.warn(chalk.red('Please use data to compile!'))
  }
  if (Object.prototype.hasOwnProperty.call(loaderOptions, 'file')) {
    delete config.options.file
    console.warn(chalk.red('Please use data to compile!'))
  }

  less
    .render(data, loaderOptions)
    .then(output => {
      next(null, output.css)
    })
    .catch(e => {
      next(null, e)
    })
}
