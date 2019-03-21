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
    if (content.replace(/\s\r\n/g, '').length <= 0) {
      content = '// Empty file'
    }
    return content
  },
  insHack (content, oriPath, compiler, type, pathParse) {},
  transformJs (
    data,
    oriPath,
    pathParse,
    compiler,
    compilation,
    resolve,
    reject
  ) {
    try {
      const ast = parse(data)
      data = generator(ast, {}, data).codex
      if (/node_modules/.test(oriPath)) {
        data = wechat.npmCodeHack(data, oriPath)
        data = this.npmCodeHack(data, oriPath)
      }
      data = this.insHack(data, oriPath, compiler, type, pathParse)
      resolve(data)
    } catch (err) {
      reject(err)
    }
  },
}
