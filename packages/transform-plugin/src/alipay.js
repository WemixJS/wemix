import wechat from './wechat'

export default {
  npmCodeHack (content, filePath) {
    const basename = npath.basename(filePath)
    switch (basename) {
      case 'lodash.js':
      case '_global.js':
      case 'lodash.min.js':
        content = content.replace(/Function\(['"]return this['"]\)\(\)/, '{}')
        break
    }
    return content
  },
}
