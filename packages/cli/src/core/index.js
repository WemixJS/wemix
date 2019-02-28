/*
 * @Description: Core index
 * @LastEditors: sanshao
 * @Date: 2019-02-20 16:38:23
 * @LastEditTime: 2019-02-28 13:03:04
 */

import * as parseOptions from './options'
import Compiler from './compiler'
import FileSystemPlugin from './plugins/fileSystem'
import OptionsApply from './optionsApply'

const wemix = function (options, callback) {
  options = parseOptions.convert(options)
  const compiler = new Compiler()
  compiler.options = options
  new FileSystemPlugin().apply(compiler)
  if (Array.isArray(options.plugins)) {
    for (const plugin of options.plugins) {
      if (typeof plugin === 'function') {
        plugin.call(compiler, compiler)
      } else {
        plugin.apply(compiler)
      }
    }
  }
  compiler.hooks.environment.callAsync(callback)
  compiler.hooks.afterEnvironment.callAsync(callback)
  compiler.options = new OptionsApply().process(options, compiler, callback)
  return compiler
}

export default wemix
