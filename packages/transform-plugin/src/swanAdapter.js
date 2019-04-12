/*
 * @Description: swanAdapter
 * @LastEditors: sanshao
 * @Date: 2019-04-01 11:43:15
 * @LastEditTime: 2019-04-11 14:55:19
 */
import npath from 'path'
import {
  SWAN_ATTRIBUTE,
  SWAN_HTML_EXT,
  SWAN_STYLE_EXT,
  SWAN_APP_CONFIG,
  SWAN_PAGE_CONFIG,
} from './constants'

export default {
  attribute: SWAN_ATTRIBUTE,
  htmlExt: SWAN_HTML_EXT,
  cssExt: SWAN_STYLE_EXT,
  appConfig: SWAN_APP_CONFIG,
  pageConfig: SWAN_PAGE_CONFIG,
  tabName: 'list',
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
