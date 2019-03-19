/*
 * @Description: ExecuteLoader Plugin
 * @LastEditors: sanshao
 * @Date: 2019-02-20 18:41:47
 * @LastEditTime: 2019-03-21 19:23:23
 */

export default class ExecuteLoaderPlugin {
  callAsync (rule, originPath, data, compiler, done) {
    let index = 0
    function next (err, data) {
      if (index >= rule.use.length) return done(null, data)
      if (err) return done(err)
      const resolve = compiler.resolverFactory.get('normal', {})
      resolve
        .resolve({}, process.cwd(), rule.use[index].loader, {})
        .then(path => {
          const fn = require(path).default
          const config = Object.assign({}, rule)
          delete config.use
          config.options = rule.use[index++].options
          fn(data, config, originPath, next)
        })
        .catch(err => {
          compiler.logger.error(err.stack || err)
          process.exit(1)
        })
    }
    next(null, data)
  }
  apply (compiler) {
    // 执行loader
    compiler.hooks.singleCompile.tapAsync(
      'LoaderCompilePlugin',
      (data, rule, originPath, callback) => {
        if (rule && rule.use && rule.use.length) {
          rule.use = rule.use.reverse()
          this.callAsync(rule, originPath, data, compiler, callback)
        } else {
          callback(null, data)
        }
      }
    )
  }
}
