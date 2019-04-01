/*
 * @Description: alipayAdapter
 * @LastEditors: sanshao
 * @Date: 2019-04-01 11:43:15
 * @LastEditTime: 2019-04-01 12:22:23
 */
import npath from 'path'
import {
  ALIPAY_ATTRIBUTE,
  ALIPAY_HTML_EXT,
  ALIPAY_STYLE_EXT,
} from './constants'

export default {
  attribute: ALIPAY_ATTRIBUTE,
  htmlExt: ALIPAY_HTML_EXT,
  cssExt: ALIPAY_STYLE_EXT,
  getCorePkg () {
    return `require('./alipay')`
  },
  getEntryConfigPath (compiler) {
    return `${npath.join(compiler.options.context, 'alipay.config.json')}`
  },
  getOutputConfigPath (compiler) {
    return `${npath.join(compiler.options.output, 'project.config.json')}`
  },
  customHack (content) {
    return content
  },
  splitJsonConfig (config, pathParse, jsonPath, type, compilation) {
    if (config.mixins) {
      config.mixins.forEach(item => {
        const jsPath = compilation.resolvePath(pathParse, item + '.js')
        compilation.waitCompile[jsPath] = null
      })
    }
    if (config.alipayMixins) {
      config.alipayMixins.forEach(item => {
        const jsPath = compilation.resolvePath(pathParse, item + '.js')
        compilation.waitCompile[jsPath] = null
      })
    }
    if (config.usingComponents) {
      for (const key in config.usingComponents) {
        const jsPath = compilation.resolvePath(
          pathParse,
          config.usingComponents[key] + '.js'
        )
        compilation.waitCompile[jsPath] = null
      }
    }
    if (config.alipayComponents) {
      for (const key in config.alipayComponents) {
        const jsPath = compilation.resolvePath(
          pathParse,
          config.alipayComponents[key] + '.js'
        )
        compilation.waitCompile[jsPath] = null
      }
    }
    // 根据type不同转译出不同的json文件

    compilation.modules[jsonPath] = JSON.stringify(config)
  },
}
