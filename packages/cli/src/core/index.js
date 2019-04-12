/*
 * @Description: Core index
 * @LastEditors: sanshao
 * @Date: 2019-02-20 16:38:23
 * @LastEditTime: 2019-04-11 20:16:07
 */

import npath from 'path'
import * as parseOptions from './options'
import Compiler from './compiler'
import FileSystemPlugin from './plugins/fileSystem'
import OutputFilePlugin from './plugins/outputFile'
import VendorPlugin from './plugins/vendor'
import ExecuteLoaderPlugin from './plugins/executeLoader'
import OptionsApply from './optionsApply'

const wemix = function (options, callback) {
  options = parseOptions.convert(options)
  const compiler = new Compiler()
  compiler.options = options
  new FileSystemPlugin().apply(compiler)
  // singleCompile hooks 第一个执行loaders
  new ExecuteLoaderPlugin().apply(compiler)
  new VendorPlugin().apply(compiler)
  if (Array.isArray(options.plugins)) {
    for (const plugin of options.plugins) {
      if (typeof plugin === 'function') {
        plugin.call(compiler, compiler)
      } else {
        plugin.apply(compiler)
      }
    }
  }
  new OutputFilePlugin().apply(compiler)
  compiler.hooks.environment.callAsync(callback)
  compiler.hooks.afterEnvironment.callAsync(callback)
  compiler.options = new OptionsApply().process(options, compiler, callback)
  process.env.NODE_ENV = compiler.options.env
  compiler.vendorDistPath = npath.join(
    compiler.options.output,
    compiler.vendorName
  )
  return compiler
}

export default wemix
