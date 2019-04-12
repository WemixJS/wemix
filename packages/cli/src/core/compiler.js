/*
 * @Description: Compile
 * @LastEditors: sanshao
 * @Date: 2019-02-20 16:59:06
 * @LastEditTime: 2019-04-11 17:00:44
 */

import { AsyncSeriesHook, AsyncSeriesWaterfallHook } from 'tapable'
import Watchpack from 'watchpack'
import fs from 'fs-extra'
import npath from 'path'

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
      singleCompile: new AsyncSeriesWaterfallHook(['data', 'loader', 'path']),
      afterSingleCompile: new AsyncSeriesWaterfallHook(['data', 'path']),
      afterCompile: new AsyncSeriesHook(['compilation']),
      emit: new AsyncSeriesHook(['compilation']),
      done: new AsyncSeriesHook([]),
      failed: new AsyncSeriesHook(['error']),
    }
    this.vendorName = './vendor.js'
    this.vendors = {}
    this.vendorId = 0
    this.overrideVendors = false
    this.watchFiles = []
    this.logger = logger
    this.cache = {}
    this.running = false
    this.compiling = false
    this.distConfig = null
    this.resolverFactory = new ResolverFactory()
    this.wp = new Watchpack({
      aggregateTimeout: 0,
    })
  }
  getLoader (path) {
    const loaders = this.options.loaders
    let loader
    for (let index = 0; index < loaders.length; index++) {
      if (loaders[index].test.test(path)) {
        loader = loaders[index]
        break
      }
    }
    return loader
  }
  finalCallback (err, callback) {
    this.compiling = false

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
    this.running = true

    const onCompiled = (err, compilation) => {
      if (err) return this.finalCallback(err, callback)
      this.hooks.emit.callAsync(compilation, err => {
        if (err) return this.finalCallback(err, callback)
        this.hooks.done.callAsync(err => {
          if (err) return this.finalCallback(err, callback)
          if (this.options.watch) {
            this.logger.info('Wemix is watching the files…')
          }
          this.compiling = false
          return this.finalCallback(null, callback)
        })
      })
    }

    this.hooks.beforeRun.callAsync(err => {
      if (err) return this.finalCallback(err, callback)

      this.hooks.run.callAsync(err => {
        if (err) return this.finalCallback(err)
        this.compile(null, onCompiled)
      })
    })
  }
  watch (options, callback) {
    const onCompiled = (err, compilation) => {
      if (err) return this.finalCallback(err, callback)
      this.hooks.emit.callAsync(compilation, err => {
        if (err) return this.finalCallback(err, callback)
        this.hooks.done.callAsync(err => {
          if (err) return this.finalCallback(err, callback)
          this.logger.info('Wemix is watching the files…')
          const fileLength = this.watchFiles.length
          if (fileLength > 0) {
            this.compile(this.watchFiles.splice(0, fileLength), onCompiled)
          } else {
            this.compiling = false
          }
          return this.finalCallback(null, callback)
        })
      })
    }
    let baseDir = ''
    for (let i = 0; i < this.options.entry.length; i++) {
      const stats = fs.statSync(this.options.entry[i])
      if (stats.isFile() && /app\.js$/.test(this.options.entry[i])) {
        baseDir = npath.dirname(this.options.entry[i])
        break
      }
    }
    if (!baseDir) {
      this.logger.error('app.js not found in entry')
      process.exit(1)
    }
    let allDirs = []
    const subDirs = getDirectories(baseDir)
    allDirs = [baseDir].concat(subDirs)
    this.wp.watch([], allDirs, Date.now())
    let fileTimes = this.wp.getTimes()
    this.wp.on('change', (filePath, mtime) => {
      const currentFileTimes = this.wp.getTimes()
      if (mtime) {
        if (
          !fileTimes[filePath] ||
          (fileTimes[filePath] &&
            currentFileTimes[filePath] - fileTimes[filePath] > 100)
        ) {
          if (!this.compiling) {
            this.compile([filePath], onCompiled)
          } else {
            this.watchFiles.push(filePath)
          }
        }
      } else {
        const distPath = filePath.replace(this.options.dir, this.options.output)
        fs.remove(distPath)
      }
      fileTimes = currentFileTimes
    })
  }
  compile (modifiedFiles, callback) {
    this.compiling = true
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
