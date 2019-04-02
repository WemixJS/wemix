/*
 * @Description: alipayAdapter
 * @LastEditors: sanshao
 * @Date: 2019-04-01 11:43:15
 * @LastEditTime: 2019-04-02 15:30:31
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
      config.mixins = []
        .concat(config.mixins || [])
        .concat(config.alipayMixins || [])
      config.mixins.forEach(item => {
        const jsPath = compilation.resolvePath(pathParse, item + '.js')
        compilation.waitCompile[jsPath] = null
      })
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
}
