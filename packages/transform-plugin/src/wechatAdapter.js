import npath from 'path'
import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import * as t from '@babel/types'
import {
  WECHAT_ATTRIBUTE,
  WECHAT_HTML_EXT,
  WECHAT_STYLE_EXT,
  WECHAT_APP_CONFIG,
  WECHAT_PAGE_CONFIG,
} from './constants'

export default {
  attribute: WECHAT_ATTRIBUTE,
  htmlExt: WECHAT_HTML_EXT,
  cssExt: WECHAT_STYLE_EXT,
  appConfig: WECHAT_APP_CONFIG,
  pageConfig: WECHAT_PAGE_CONFIG,
  getEntryConfigPath (compiler) {
    return `${npath.join(compiler.options.context, 'wechat.config.json')}`
  },
  getOutputConfigPath (compiler) {
    return `${npath.join(compiler.options.output, 'project.config.json')}`
  },
  splitJsonConfig (configNode, config, pathParse, jsonPath, type, compilation) {
    const adpaterConfig = {}
    if (type === 'app') {
      for (const key in this.appConfig) {
        if (key === 'window') {
          if (config[key]) {
            const window = {}
            for (const skey in this.appConfig[key]) {
              if (config[key][skey] !== undefined) {
                window[skey] = config[key][skey]
              }
            }
            adpaterConfig[key] = window
          }
        } else if (key === 'tabBar') {
          if (config[key]) {
            const tabBar = {}
            for (const skey in this.appConfig[key]) {
              if (skey === 'list') {
                const list = config[key][skey].map(item => {
                  const tab = Object.assign({}, this.appConfig[key][skey])
                  for (const tkey in tab) {
                    tab[tkey] = item[tab[tkey]]
                  }
                  return tab
                })
                tabBar[skey] = list
              } else {
                if (config[key][skey] !== undefined) {
                  tabBar[skey] = config[key][skey]
                }
              }
            }
            adpaterConfig[key] = tabBar
          }
        } else {
          if (config[this.appConfig[key]] !== undefined) {
            adpaterConfig[key] = config[this.appConfig[key]]
          }
        }
      }
      if (config.wechat) {
        for (const key in config.wechat) {
          if (toString.call(config.wechat[key]) === '[object Object]') {
            adpaterConfig[key] = Object.assign(
              adpaterConfig[key] || {},
              config.wechat[key] || {}
            )
          } else {
            adpaterConfig[key] = config.wechat[key]
          }
        }
      }
    }
    if (type === 'page' || type === 'component') {
      config.usingComponents = Object.assign(
        config.usingComponents || {},
        config.wechatComponents || {}
      )
      for (const key in config.usingComponents) {
        const jsPath = compilation.resolvePath(
          pathParse,
          config.usingComponents[key] + '.js'
        )
        compilation.waitCompile[jsPath] = null
      }
      for (const key in this.pageConfig) {
        if (config[this.pageConfig[key]] !== undefined) {
          adpaterConfig[key] = config[this.pageConfig[key]]
        }
      }
    }
    if (type === 'component') {
      adpaterConfig.component = true
    }
    const configTempName = 'config'
    let strCfg = JSON.stringify(adpaterConfig).replace(/"/g, `'`)
    strCfg = `const ${configTempName} = ${strCfg};`
    const astCfg = parse(strCfg)
    traverse(astCfg, {
      VariableDeclarator (astPath) {
        const id = astPath.get('id')
        if (id.isIdentifier({ name: configTempName })) {
          configNode
            .get('right')
            .replaceWith(
              t.objectExpression(astPath.get('init').node.properties)
            )
        }
      },
    })
    compilation.modules[jsonPath] = JSON.stringify(adpaterConfig)
  },
  processProps (propsNode, props, compiler) {
    for (const key in props) {
      if (toString.call(props[key]) === '[object Object]') {
        if (props[key].observer) {
          compiler.logger.error('not support observer now!')
        }
      }
    }
  },
  npmCodeHack (content, filePath) {
    const basename = npath.basename(filePath)
    switch (basename) {
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
}
