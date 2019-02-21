/*
 * @Description: resolve Options Apply
 * @LastEditors: sanshao
 * @Date: 2019-02-20 18:55:12
 * @LastEditTime: 2019-02-20 19:48:09
 */

import CompilePlugin from './plugins/compile'

export default class OptionsApply {
  process (options, compiler, callback) {
    new CompilePlugin().apply(compiler)
    compiler.hooks.afterPlugins.callAsync(callback)
    if (!compiler.inputFileSystem) {
      throw new Error('No input filesystem provided')
    }
    // 查找文件名路径
    compiler.resolverFactory.hooks.resolveOptions
      .for('normal')
      .tap('OptionsApply', resolveOptions => {
        return Object.assign(
          {
            fileSystem: compiler.inputFileSystem,
          },
          options.resolve,
          resolveOptions
        )
      })
    // 查找文件夹及module_name
    compiler.resolverFactory.hooks.resolveOptions
      .for('context')
      .tap('OptionsApply', resolveOptions => {
        return Object.assign(
          {
            fileSystem: compiler.inputFileSystem,
            resolveToContext: true,
          },
          options.resolve,
          resolveOptions
        )
      })
    compiler.resolverFactory.hooks.resolveOptions
      .for('loader')
      .tap('OptionsApply', resolveOptions => {
        return Object.assign(
          {
            fileSystem: compiler.inputFileSystem,
          },
          options.resolveLoader,
          resolveOptions
        )
      })
    compiler.hooks.afterResolvers.callAsync(callback)
    return options
  }
}
