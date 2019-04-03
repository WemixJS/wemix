/*
 * @Description: alipayAdapter
 * @LastEditors: sanshao
 * @Date: 2019-04-01 11:43:15
 * @LastEditTime: 2019-04-02 20:15:55
 */
import npath from 'path'
import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import * as t from '@babel/types'
import {
  ALIPAY_ATTRIBUTE,
  ALIPAY_HTML_EXT,
  ALIPAY_STYLE_EXT,
  ALIPAY_APP_CONFIG,
  ALIPAY_PAGE_CONFIG,
} from './constants'

export default {
  attribute: ALIPAY_ATTRIBUTE,
  htmlExt: ALIPAY_HTML_EXT,
  cssExt: ALIPAY_STYLE_EXT,
  appConfig: ALIPAY_APP_CONFIG,
  pageConfig: ALIPAY_PAGE_CONFIG,
  getEntryConfigPath (compiler) {
    return `${npath.join(compiler.options.context, 'alipay.config.json')}`
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
              if (skey === 'items') {
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
      if (config.alipay) {
        for (const key in config.alipay) {
          if (toString.call(config.alipay[key]) === '[object Object]') {
            adpaterConfig[key] = Object.assign(
              adpaterConfig[key] || {},
              config.alipay[key] || {}
            )
          } else {
            adpaterConfig[key] = config.alipay[key]
          }
        }
      }
    }
    if (type === 'page' || type === 'component') {
      config.usingComponents = Object.assign(
        config.usingComponents || {},
        config.alipayComponents || {}
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
    const newProps = {}
    for (const key in props) {
      if (toString.call(props[key]) === '[object Object]') {
        if (props[key].observer) {
          compiler.logger.error('not support observer now!')
        }
        newProps[key] = props[key].value
      } else {
        newProps[key] = props[key]
      }
    }
    const propsTempName = 'properties'
    let strCfg = JSON.stringify(newProps).replace(/"/g, `'`)
    strCfg = `const ${propsTempName} = ${strCfg};`
    const astCfg = parse(strCfg)
    traverse(astCfg, {
      VariableDeclarator (astPath) {
        const id = astPath.get('id')
        if (id.isIdentifier({ name: propsTempName })) {
          propsNode
            .get('right')
            .replaceWith(
              t.objectExpression(astPath.get('init').node.properties)
            )
        }
      },
    })
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
    if (content.replace(/\s\r\n/g, '').length <= 0) {
      content = '// Empty file'
    }
    return content
  },
}
