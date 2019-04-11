/*
 * @Description: ttAdapter
 * @LastEditors: sanshao
 * @Date: 2019-04-01 11:43:15
 * @LastEditTime: 2019-04-11 14:55:27
 */
import npath from 'path'
import {
  TT_ATTRIBUTE,
  TT_HTML_EXT,
  TT_STYLE_EXT,
  TT_APP_CONFIG,
  TT_PAGE_CONFIG,
} from './constants'

export default {
  attribute: TT_ATTRIBUTE,
  htmlExt: TT_HTML_EXT,
  cssExt: TT_STYLE_EXT,
  appConfig: TT_APP_CONFIG,
  pageConfig: TT_PAGE_CONFIG,
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
