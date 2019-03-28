/*
 * @Description: Compilation
 * @LastEditors: sanshao
 * @Date: 2019-02-20 19:00:43
 * @LastEditTime: 2019-03-28 15:49:29
 */
import npath from 'path'
import fs from 'fs'
import { getFiles } from '../utils'

export default class Compilation {
  constructor (compiler, modifiedFiles) {
    // 将修改的文件或者entry的初始文件存入waitCompile(待编译)池中，用于后续编译使用
    if (!modifiedFiles || modifiedFiles.length === 0) {
      const configPath = `${npath.join(
        compiler.options.context,
        'wechat.config.json'
      )}`
      modifiedFiles = []
      compiler.options.entry.forEach(item => {
        let stat = fs.statSync(item)
        if (stat.isFile()) {
          modifiedFiles = modifiedFiles.concat(item)
        } else {
          const files = getFiles(item).map(file => {
            return npath.join(item, file)
          })
          modifiedFiles = modifiedFiles.concat(files)
        }
      })
      modifiedFiles.push(configPath)
    }
    this.waitCompile = {}
    modifiedFiles.forEach(item => {
      this.waitCompile[item] = null
    })
    this.compiler = compiler
    // 编译完成的结果存入modules(结果)池中,用于后续全量写入
    this.modules = {}
  }
  modifiedFileMTime (file) {
    const mtime = +fs.statSync(file).mtime
    if (this.compiler.cache[file] !== mtime) {
      this.compiler.cache[file] = mtime
      return true
    } else {
      return false
    }
  }
  getPages (pages) {
    if (!pages || !pages.length) {
      this.compiler.logger.error(`app.json pages 配置有误，缺少页面相关配置`)
      return new Set()
    }
    return new Set(pages)
  }
  resolvePath (pathParse, item) {
    let path = npath.resolve(pathParse.dir, item)
    if (path[0] === '/') {
      path = npath.join(this.compiler.options.dir, path)
    }
    return path
  }
  getRequirePath (baseDir, requirePath, astPath) {
    const resolver = this.compiler.resolverFactory.get('normal', {})
    return new Promise((resolve, reject) => {
      resolver
        .resolve({}, baseDir, requirePath, {})
        .then(absPath => {
          resolve({ absPath, astPath })
        })
        .catch(reject)
    })
  }

  getSubPackages (pages, subpackages) {
    if (!subpackages || !subpackages.length) {
      return pages
    }
    subpackages.forEach(item => {
      if (item.pages && item.pages.length) {
        const root = item.root
        item.pages.forEach(page => {
          let pagePath = `${root}/${page}`
          pagePath = pagePath.replace(/\/{2,}/g, '/')
          pages.add(pagePath)
        })
      }
    })
    return pages
  }
}
