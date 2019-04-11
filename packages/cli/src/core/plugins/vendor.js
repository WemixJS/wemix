/*
 * @Description: Vendor Plugin
 * @LastEditors: sanshao
 * @Date: 2019-02-20 18:41:47
 * @LastEditTime: 2019-04-11 16:29:34
 */

const VENDOR_INJECTION = [
  `
global.__wemix_require = (function(modules) {
   // The module cache
   var installedModules = {};
   // The require function
   function __wemix_require(moduleId) {
        moduleId = parseInt(moduleId)
       // Check if module is in cache
       if(installedModules[moduleId])
           return installedModules[moduleId].exports;
       // Create a new module (and put it into the cache)
       var module = installedModules[moduleId] = {
           exports: {},
           id: moduleId,
           loaded: false
       };
       // Execute the module function
       modules[moduleId].call(module.exports, module, module.exports, __wemix_require);
       // Flag the module as loaded
       module.loaded = true;
       // Return the exports of the module
       return module.exports;
   }
   // expose the modules object (__webpack_modules__)
   __wemix_require.m = modules;
   // expose the module cache
   __wemix_require.c = installedModules;
   // __webpack_public_path__
   __wemix_require.p = "/";
   // Load entry module and return exports
   module.exports = __wemix_require;
   return __wemix_require;
})([
`,
  '',
  ']);',
]

export default class OutputFilePlugin {
  mergeNpm (compiler, compilation) {
    const length = Object.keys(compiler.vendors).length
    let [index, code] = [0, '']
    for (const key in compiler.vendors) {
      code += '/***** module ' + compiler.vendors[key] + ' start *****/\n'
      code += '/***** ' + key + ' *****/\n'
      code += 'function(module, exports, __wemix_require) {'
      code += compilation.modules[key] + '\n'
      code += '}'
      if (index !== length - 1) {
        code += ','
      }
      code += '/***** module ' + compiler.vendors[key] + ' end *****/\n\n\n'
      index++
    }
    let methodName = ''
    switch (compiler.options.export) {
      case 'wechat':
        methodName = 'wx'
        break
      case 'alipay':
        methodName = 'my'
        break
      case 'swan':
        methodName = 'swan'
        break
      case 'tt':
        methodName = 'tt'
        break
    }
    VENDOR_INJECTION[0] = VENDOR_INJECTION[0].replace(
      'global.',
      `${methodName}.`
    )
    let template = VENDOR_INJECTION.concat([])
    template[1] = code
    return template.join('')
  }
  apply (compiler) {
    // 写入到目标目录
    compiler.hooks.emit.tapAsync(
      'WechatEmitPlugin',
      (compilation, callback) => {
        if (compiler.overrideVendors) {
          const code = this.mergeNpm(compiler, compilation)
          compilation.modules[compiler.vendorDistPath] = code
        }
        callback()
      }
    )
  }
}
