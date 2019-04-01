import npath from 'path'
import {
  WECHAT_ATTRIBUTE,
  WECHAT_HTML_EXT,
  WECHAT_STYLE_EXT,
} from './constants'

export default {
  attribute: WECHAT_ATTRIBUTE,
  htmlExt: WECHAT_HTML_EXT,
  cssExt: WECHAT_STYLE_EXT,
  getCorePkg () {
    return `require('./wechat')`
  },
  getEntryConfigPath (compiler) {
    return `${npath.join(compiler.options.context, 'wechat.config.json')}`
  },
  getOutputConfigPath (compiler) {
    return `${npath.join(compiler.options.output, 'project.config.json')}`
  },
  customHack (content) {
    content = content.replace(/([\w[\]a-d.]+)\s*instanceof Function/g, function (
      matchs,
      word
    ) {
      return ' typeof ' + word + " ==='function' "
    })
    return content
  },
  splitJsonConfig (config, pathParse, jsonPath, type, compilation) {
    if (config.mixins) {
      config.mixins.forEach(item => {
        const jsPath = compilation.resolvePath(pathParse, item + '.js')
        compilation.waitCompile[jsPath] = null
      })
    }
    if (config.wechatMixins) {
      config.wechatMixins.forEach(item => {
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
    if (config.wechatComponents) {
      for (const key in config.wechatComponents) {
        const jsPath = compilation.resolvePath(
          pathParse,
          config.wechatComponents[key] + '.js'
        )
        compilation.waitCompile[jsPath] = null
      }
    }
    // 根据type不同转译出不同的json文件

    compilation.modules[jsonPath] = JSON.stringify(config)
  },
}
