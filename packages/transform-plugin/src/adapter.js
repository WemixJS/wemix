import npath from 'path'
import { EXPORT_ALIPAY } from './constants'
import wechat from './wechatAdapter'
import alipay from './alipay'

export default class Adapter {
  constructor (compiler) {
    if (compiler) {
      switch (compiler.options.export) {
        case EXPORT_ALIPAY:
          this.platform = alipay
          break
        default:
          this.platform = wechat
          break
      }
    } else {
      this.platform = wechat
    }
  }
  getCorePkg () {
    return this.platform.getCorePkg()
  }
  getEntryConfigPath (compiler) {
    return this.platform.getEntryConfigPath(compiler)
  }
  getOutputConfigPath (compiler) {
    return this.platform.getOutputConfigPath(compiler)
  }
  getOutputPath (oriPath, compiler) {
    return oriPath
      .replace(compiler.options.dir, compiler.options.output)
      .replace(
        'node_modules',
        npath.join(compiler.options.export, npath.sep, 'npm')
      )
      .replace('.html', this.platform.htmlExt)
      .replace(/\.(css|less|sass|scss|acss|styl)/, this.platform.cssExt)
  }
  customHack (data, oriPath, compiler, type, pathParse) {
    if (/node_modules/.test(oriPath)) {
      data = this.platform.npmCodeHack(data, oriPath)
    }
    if (/^(app|page|component)$/.test(type)) {
      data = wrapPageUp(data, oriPath, compiler, type, pathParse)
      data = this.platform.customHack(data)
    }
    return data
  }
  transformHtml () {}
  transformJs () {}
  transformStyle () {}
  splitConfig (config, pathParse, jsonPath, componentName, compilation) {
    this.platform.splitConfig(
      config,
      pathParse,
      jsonPath,
      componentName,
      compilation
    )
  }
}

const wrapPageUp = (content, oriPath, compiler, type, pathParse) => {
  if (/^(app|page|component)$/.test(type)) {
    let replace = ''
    content = content.replace(
      /exports\.default\s*=\s*((\w+);)/gi,
      (m, b, defaultExport) => {
        if (defaultExport === 'undefined') {
          return ''
        }
        if (type === 'app') {
          const vars = content.match(/\((.+?)\.default\.app\)/)[1]
          replace = `\nApp(${vars}.default.$createApp(${defaultExport}));\n`
        } else if (type === 'page') {
          const pagePath = npath
            .join(
              npath.relative(compiler.options.dir, pathParse.dir),
              pathParse.name
            )
            .replace(/\\/gi, '/')
          const vars = content.match(/\((.+?)\.default\.page\)/)[1]
          replace = `\nPage(${vars}.default.$createPage(${defaultExport} , '${pagePath}'));\n`
        } else if (type === 'component') {
          const pagePath = npath
            .join(
              npath.relative(compiler.options.dir, pathParse.dir),
              pathParse.name
            )
            .replace(/\\/gi, '/')
          const vars = content.match(/\((.+?)\.default\.component\)/)[1]
          replace = `\nComponent(${vars}.default.$createComponent(${defaultExport} , '${pagePath}'));\n`
        }
        return ''
      }
    )
    content += replace
  }
  return content
}
