/*
 * @Description: Compile
 * @LastEditors: sanshao
 * @Date: 2019-02-20 16:59:06
 * @LastEditTime: 2019-02-21 11:49:52
 */

import { AsyncSeriesHook } from 'tapable'

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
      run: new AsyncSeriesHook(['compilation']),
      beforeCompile: new AsyncSeriesHook([]),
      compile: new AsyncSeriesHook(['compilation']),
      afterCompile: new AsyncSeriesHook(['compilation']),
      emit: new AsyncSeriesHook([]),
      done: new AsyncSeriesHook([]),
      failed: new AsyncSeriesHook(['error']),
    }
    this.logger = logger
    this.running = false
    this.cache = {}
    this.resolverFactory = new ResolverFactory()
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

    const onCompiled = err => {
      if (err) return finalCallback(err)
      this.hooks.emit.callAsync(err => {
        if (err) return finalCallback(err)
        this.hooks.done.callAsync(err => {
          if (err) return finalCallback(err)
          return finalCallback(null)
        })
      })
    }

    this.running = true
    this.hooks.beforeRun.callAsync(err => {
      if (err) return finalCallback(err)

      this.hooks.run.callAsync(err => {
        if (err) return finalCallback(err)
        this.compile(new Map(), onCompiled)
      })
    })
  }
  watch () {}
  compile (map, callback) {
    let compilation
    if (!compilation || (compilation && compilation.writed)) {
      compilation = new Compilation(this, map)
    }
    // this.hooks.beforeCompile.callAsync(err => {
    //   if (err) return callback(err)
    //   this.hooks.compile.callAsync(compilation, err => {
    //     if (err) return callback(err)

    //     this.hooks.afterCompile.callAsync(compilation, err => {
    //       if (err) return callback(err)

    //       return callback(null)
    //     })
    //   })
    // })
  }
}
