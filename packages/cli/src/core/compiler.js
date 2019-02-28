/*
 * @Description: Compile
 * @LastEditors: sanshao
 * @Date: 2019-02-20 16:59:06
 * @LastEditTime: 2019-02-28 14:26:04
 */

import { AsyncSeriesHook, AsyncSeriesWaterfallHook } from 'tapable'

import ResolverFactory from './resolverFactory'
import logger from '../utils/logger'
import Compilation from './compilation'

export default class Compiler {
  constructor () {
    this.hooks = {
      environment: new AsyncSeriesHook([]),
      afterEnvironment: new AsyncSeriesHook([]),
      afterPlugins: new AsyncSeriesHook([]),
      afterResolvers: new AsyncSeriesHook([]),
      beforeRun: new AsyncSeriesHook([]),
      run: new AsyncSeriesHook([]),
      beforeCompile: new AsyncSeriesHook(['compilation']),
      compile: new AsyncSeriesHook(['compilation']),
      beforeSingleCompile: new AsyncSeriesWaterfallHook(['data']),
      singleCompile: new AsyncSeriesWaterfallHook(['data', 'rule']),
      afterSingleCompile: new AsyncSeriesWaterfallHook(['data']),
      afterCompile: new AsyncSeriesHook(['compilation']),
      emit: new AsyncSeriesHook(['compilation']),
      done: new AsyncSeriesHook([]),
      failed: new AsyncSeriesHook(['error']),
    }
    this.logger = logger
    this.running = false
    this.resolverFactory = new ResolverFactory()
  }
  getRule (path) {
    const rules = this.options.module.rules
    let rule
    for (let index = 0; index < rules.length; index++) {
      if (rules[index].test.test(path)) {
        rule = rules[index]
        break
      }
    }
    return rule
  }
  run (callback) {
    if (this.running) {
      return callback(
        'You ran Wemix twice. Each instance only supports a single concurrent compilation at a time.'
      )
    }
    // const resolve = this.resolverFactory.get('normal', {})
    // resolve.resolve({}, process.cwd(), './src/app.js', {}, (err, file) => {
    //   if (err) console.log(err)
    //   console.log('...', file)
    // })

    const finalCallback = err => {
      this.running = false

      if (err) {
        this.hooks.failed.callAsync(err)
      }

      return callback(err)
    }

    const onCompiled = (err, compilation) => {
      if (err) return finalCallback(err)
      this.logger.start('开始写入')
      this.hooks.emit.callAsync(compilation, err => {
        if (err) return finalCallback(err)
        this.hooks.done.callAsync(err => {
          if (err) return finalCallback(err)
          this.logger.success('写入成功')
          this.running = false
          return finalCallback(null)
        })
      })
    }

    this.running = true
    this.hooks.beforeRun.callAsync(err => {
      if (err) return finalCallback(err)

      this.hooks.run.callAsync(err => {
        if (err) return finalCallback(err)
        this.compile(null, onCompiled, true)
      })
    })
  }
  watch () {
    // this.compile('有值才执行', onCompiled)
  }
  compile (modifiedFiles, callback, first) {
    const compilation = new Compilation(this, modifiedFiles)
    this.hooks.beforeCompile.callAsync(compilation, err => {
      if (err) return callback(err, compilation)
      this.logger.start('开始编译')
      this.hooks.compile.callAsync(compilation, err => {
        if (err) return callback(err, compilation)

        this.hooks.afterCompile.callAsync(compilation, err => {
          if (err) return callback(err, compilation)
          this.logger.success('编译成功')
          return callback(null, compilation)
        })
      })
    })
  }
}
