/*
 * @Description: ExecuteLoader Plugin
 * @LastEditors: sanshao
 * @Date: 2019-02-20 18:41:47
 * @LastEditTime: 2019-03-25 17:13:08
 */

export default class ExecuteLoaderPlugin {
  callAsync (loader, originPath, data, compiler, done) {
    let index = 0
    function next (err, data) {
      if (err) return done(err)
      if (index >= loader.use.length) return done(null, data)
      const resolve = compiler.resolverFactory.get('normal', {})
      resolve
        .resolve({}, process.cwd(), loader.use[index].loader, {})
        .then(path => {
          const fn = require(path).default
          const config = Object.assign({}, loader)
          delete config.use
          config.options = loader.use[index++].options
          fn(data, config, originPath, next)
        })
        .catch(err => {
          done(err)
        })
    }
    next(null, data)
  }
  apply (compiler) {
    // 执行loader
    compiler.hooks.singleCompile.tapAsync(
      'LoaderCompilePlugin',
      (data, loader, originPath, callback) => {
        if (loader && loader.use && loader.use.length) {
          loader.use = loader.use.reverse()
          this.callAsync(loader, originPath, data, compiler, callback)
        } else {
          callback(null, data)
        }
      }
    )
  }
}
