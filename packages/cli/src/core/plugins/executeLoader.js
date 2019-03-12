/*
 * @Description: ExecuteLoader Plugin
 * @LastEditors: sanshao
 * @Date: 2019-02-20 18:41:47
 * @LastEditTime: 2019-03-12 10:22:59
 */

export default class ExecuteLoaderPlugin {
  callAsync (list, originPath, data, compiler, done) {
    let index = 0
    function next (err, data) {
      if (index >= list.length) return done(null, data)
      if (err) return done(err)
      try {
        const resolve = compiler.resolverFactory.get('normal', {})
        resolve.resolve(
          {},
          process.cwd(),
          list[index].loader,
          {},
          (err, file) => {
            if (err) throw err
            const fn = require(file).default
            fn(data, list[index++].options, originPath, next)
          }
        )
      } catch (err) {
        compiler.logger.error(err.stack || err)
        process.exit(1)
      }
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
          this.callAsync(rule.use, originPath, data, compiler, callback)
        } else {
          callback(null, data)
        }
      }
    )
  }
}
