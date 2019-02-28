/*
 * @Description: WatchFileSystem
 * @LastEditors: sanshao
 * @Date: 2019-02-20 18:41:47
 * @LastEditTime: 2019-02-20 18:55:02
 */

import Watchpack from 'watchpack'

export default class WatchFileSystem {
  constructor (inputFileSystem) {
    this.inputFileSystem = inputFileSystem
    this.watcherOptions = {
      aggregateTimeout: 0,
    }
    this.watcher = new Watchpack(this.watcherOptions)
  }

  watch (files, dirs, missing, startTime, options, callback, callbackUndelayed) {
    if (!Array.isArray(files)) {
      throw new Error("Invalid arguments: 'files'")
    }
    if (!Array.isArray(dirs)) {
      throw new Error("Invalid arguments: 'dirs'")
    }
    if (!Array.isArray(missing)) {
      throw new Error("Invalid arguments: 'missing'")
    }
    if (typeof callback !== 'function') {
      throw new Error("Invalid arguments: 'callback'")
    }
    if (typeof startTime !== 'number' && startTime) {
      throw new Error("Invalid arguments: 'startTime'")
    }
    if (typeof options !== 'object') {
      throw new Error("Invalid arguments: 'options'")
    }
    if (typeof callbackUndelayed !== 'function' && callbackUndelayed) {
      throw new Error("Invalid arguments: 'callbackUndelayed'")
    }
    const oldWatcher = this.watcher
    this.watcher = new Watchpack(options)

    if (callbackUndelayed) {
      this.watcher.once('change', callbackUndelayed)
    }
    const cachedFiles = files
    const cachedDirs = dirs
    this.watcher.once('aggregated', (changes, removals) => {
      if (this.inputFileSystem && this.inputFileSystem.purge) {
        for (const item of changes) {
          this.inputFileSystem.purge(item)
        }
        for (const item of removals) {
          this.inputFileSystem.purge(item)
        }
      }
      const times = this.watcher.getTimeInfoEntries()
      callback(null, times, times, removals)
    })

    this.watcher.watch(cachedFiles.concat(missing), cachedDirs, startTime)

    if (oldWatcher) {
      oldWatcher.close()
    }
    return {
      close: () => {
        if (this.watcher) {
          this.watcher.close()
          this.watcher = null
        }
      },
      pause: () => {
        if (this.watcher) {
          this.watcher.pause()
        }
      },
      getFileTimeInfoEntries: () => {
        if (this.watcher) {
          return this.watcher.getTimeInfoEntries()
        } else {
          return new Map()
        }
      },
      getContextInfoEntries: () => {
        if (this.watcher) {
          return this.watcher.getTimeInfoEntries()
        } else {
          return new Map()
        }
      },
    }
  }
}
