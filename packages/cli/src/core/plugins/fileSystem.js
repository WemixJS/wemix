/*
 * @Description: FileSystem Plugin
 * @LastEditors: sanshao
 * @Date: 2019-02-20 18:41:47
 * @LastEditTime: 2019-03-12 16:41:15
 */

import CachedInputFileSystem from 'enhanced-resolve/lib/CachedInputFileSystem'
import NodeJsInputFileSystem from 'enhanced-resolve/lib/NodeJsInputFileSystem'

export default class FileSystemPlugin {
  apply (compiler) {
    compiler.inputFileSystem = new CachedInputFileSystem(
      new NodeJsInputFileSystem(),
      60000
    )
    const inputFileSystem = compiler.inputFileSystem
    compiler.hooks.beforeRun.tapAsync('FileSystemPlugin', callback => {
      if (compiler.inputFileSystem === inputFileSystem) {
        inputFileSystem.purge()
      }

      callback()
    })
  }
}
