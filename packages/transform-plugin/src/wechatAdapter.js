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
  npmCodeHack (content, filePath) {
    const basename = npath.basename(filePath)
    switch (basename) {
      case 'lodash.js':
      case '_global.js':
      case 'lodash.min.js':
        content = content.replace(/Function\(['"]return this['"]\)\(\)/, 'this')
        break
      case '_html.js':
        content = 'module.exports = false;'
        break
      case '_microtask.js':
        content = content.replace('if(Observer)', 'if(false && Observer)')
        // IOS 1.10.2 Promise BUG
        content = content.replace(
          'Promise && Promise.resolve',
          'false && Promise && Promise.resolve'
        )
        break
      case '_freeGlobal.js':
        content = content.replace(
          'module.exports = freeGlobal;',
          'module.exports = freeGlobal || this || global || {};'
        )
        break
    }
    return content
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
  splitConfig (config, pathParse, jsonPath, type, compilation) {
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
