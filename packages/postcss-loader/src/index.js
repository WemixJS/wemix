/*
 * @Description: postcss-loader
 * @LastEditors: sanshao
 * @Date: 2019-02-28 14:32:47
 * @LastEditTime: 2019-03-27 17:29:47
 */

import loaderUtils from 'loader-utils'
import validateOptions from 'schema-utils'
import postcss from 'postcss'
import parseOptions from './options.js'
import optionConfig from './option'

export default function (data, loader, path, next) {
  if (!data) {
    return next(null, data)
  }
  if (loader.options && loader.options.configFile) {
    loader.options = require(loader.options.configFile)
    delete loader.options.configFile
  }
  let loaderOptions =
    (loader.options && loaderUtils.getOptions({ query: loader.options })) || {}
  validateOptions(optionConfig, loaderOptions, 'PostCSS Loader')

  const sourceMap = loaderOptions.sourceMap

  Promise.resolve()
    .then(() => {
      const length = Object.keys(loaderOptions).filter(option => {
        switch (option) {
          case 'ident':
          case 'config':
          case 'sourceMap':
            return
          default:
            return option
        }
      }).length
      if (length) {
        return parseOptions(loaderOptions)
      }
    })
    .then(config => {
      if (!config) {
        config = {}
      }

      let plugins = config.plugins || []

      let options = Object.assign(
        {
          from: path,
          map: sourceMap
            ? sourceMap === 'inline'
              ? { inline: true, annotation: false }
              : { inline: false, annotation: false }
            : false,
        },
        config.options
      )

      // 官方文档中不建议使用
      /*
      In most cases options.from && options.to are set by the third-party which integrates this package (CLI, gulp, webpack).
      It's unlikely one needs to set/use options.from && options.to within a config file.
      */
      if (options.to) {
        delete config.options.to
      }
      if (options.from) {
        delete config.options.from
      }

      // Set PostCSS Parser
      if (typeof options.parser === 'string') {
        options.parser = require(options.parser)
      }

      // Set PostCSS Syntax
      if (typeof options.syntax === 'string') {
        options.syntax = require(options.syntax)
      }

      // Set PostCSS Stringifier
      if (typeof options.stringifier === 'string') {
        options.stringifier = require(options.stringifier)
      }

      postcss(plugins)
        .process(data, options)
        .then(result => {
          let { css } = result

          next(null, css)
        })
        .catch(err => {
          next(err)
        })
    })
    .catch(err => {
      next(err)
    })
}
