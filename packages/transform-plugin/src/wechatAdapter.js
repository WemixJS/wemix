import npath from 'path'
import { WECHAT_ATTRIBUTE } from './constants'

export default {
  attribute: WECHAT_ATTRIBUTE,
  getEntryConfigPath (compiler) {
    return `${npath.join(compiler.options.context, 'wechat.config.json')}`
  },
  getOutputConfigPath (compiler) {
    return `${npath.join(compiler.options.output, 'project.config.json')}`
  },
  getOutputPath (oriPath, compiler) {
    let distPath = oriPath.replace(
      compiler.options.dir,
      compiler.options.output
    )
    distPath = distPath.replace(
      'node_modules',
      npath.join(compiler.options.export, npath.sep, 'npm')
    )
    distPath = distPath
      .replace('.html', '.wxml')
      .replace('.css', '.wxss')
      .replace('.less', '.wxss')
      .replace('.sass', '.wxss')
      .replace('.scss', '.wxss')
      .replace('.acss', '.wxss')
      .replace('.styl', '.wxss')
    return distPath
  },
}
