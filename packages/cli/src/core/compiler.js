/*
 * @Description: Compile
 * @LastEditors: sanshao
 * @Date: 2019-02-20 16:59:06
 * @LastEditTime: 2019-03-12 16:39:38
 */

import { AsyncSeriesHook, AsyncSeriesWaterfallHook } from 'tapable'
import Watchpack from 'watchpack'
import fs from 'fs-extra'

import ResolverFactory from './resolverFactory'
import logger from '../utils/logger'
import Compilation from './compilation'
import { getDirectories } from '../utils'

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
      beforeSingleCompile: new AsyncSeriesWaterfallHook(['data', 'path']),
      singleCompile: new AsyncSeriesWaterfallHook(['data', 'rule', 'path']),
      afterSingleCompile: new AsyncSeriesWaterfallHook(['data', 'path']),
      afterCompile: new AsyncSeriesHook(['compilation']),
      emit: new AsyncSeriesHook(['compilation']),
      done: new AsyncSeriesHook([]),
      failed: new AsyncSeriesHook(['error']),
    }
    this.logger = logger
    this.cache = {}
    this.running = false
    this.distConfig = null
    this.resolverFactory = new ResolverFactory()
    this.wp = new Watchpack({
      aggregateTimeout: 0,
    })
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
  finalCallback (err, callback) {
    this.running = false

    if (err) {
      this.hooks.failed.callAsync(err)
    }

    return callback(err)
  }
  run (callback) {
    if (this.running) {
      return callback(
        'You ran Wemix twice. Each instance only supports a single concurrent compilation at a time.'
      )
    }

    const onCompiled = (err, compilation) => {
      if (err) return this.finalCallback(err, callback)
      this.logger.start('开始写入')
      this.hooks.emit.callAsync(compilation, err => {
        if (err) return this.finalCallback(err, callback)
        this.hooks.done.callAsync(err => {
          if (err) return this.finalCallback(err, callback)
          this.logger.success('写入成功')
          this.running = false
          return this.finalCallback(null, callback)
        })
      })
    }

    this.running = true
    this.hooks.beforeRun.callAsync(err => {
      if (err) return this.finalCallback(err, callback)

      this.hooks.run.callAsync(err => {
        if (err) return this.finalCallback(err)
        this.compile(null, onCompiled, true)
      })
    })
  }
  watch (options, callback) {
    const onCompiled = (err, compilation) => {
      if (err) return this.finalCallback(err, callback)
      this.logger.start('开始写入')
      this.hooks.emit.callAsync(compilation, err => {
        if (err) return this.finalCallback(err, callback)
        this.hooks.done.callAsync(err => {
          if (err) return this.finalCallback(err, callback)
          this.logger.success('写入成功')
          this.running = false
          return this.finalCallback(null, callback)
        })
      })
    }
    const subDirs = getDirectories(this.options.entryDir)
    const allDirs = [this.options.entryDir].concat(subDirs)
    this.run(() => {
      this.wp.watch([], allDirs, Date.now())
      this.wp.on('change', (filePath, mtime) => {
        if (mtime) {
          if (!this.running) {
            this.compile([filePath], onCompiled)
          }
        } else {
          const distPath = filePath.replace(
            this.options.entryDir,
            this.options.outputDir
          )
          fs.remove(distPath)
        }
      })
    })
  }
  compile (modifiedFiles, callback) {
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
