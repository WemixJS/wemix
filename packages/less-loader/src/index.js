/*
 * @Description: less-loader
 * @LastEditors: sanshao
 * @Date: 2019-02-28 14:32:47
 * @LastEditTime: 2019-05-09 19:45:35
 */

import less from 'less'
import chalk from 'chalk'
import https from 'https'
import loaderUtils from 'loader-utils'
import npath from 'path'

function _type (path) {
  return Object.prototype.toString.call(path)
}

function _dealPath (path) {
  return npath.resolve(process.cwd(), path)
}

function accMul (arg1, arg2) {
  let m = 0
  let s1 = arg1.toString()
  let s2 = arg2.toString()
  try {
    m += s1.split('.')[1].length
  } catch (e) {}
  try {
    m += s2.split('.')[1].length
  } catch (e) {}
  return (
    (Number(s1.replace('.', '')) * Number(s2.replace('.', ''))) /
    Math.pow(10, m)
  )
}

function grabConfigFromScript (str, n) {
  let stash = []
  let rst = ''
  for (let i = n, l = str.length; i < l; i++) {
    if (str[i] === '{') {
      stash.push('{')
    }
    if (str[i] === '}') {
      stash.pop()
      if (stash.length === 0) {
        rst += '}'
        break
      }
    }
    if (stash.length) {
      rst += str[i]
    }
  }
  return rst
}

function loadIconfont (data) {
  return new Promise((resolve, reject) => {
    if (data) {
      // 注释清除
      data = data.replace(/\/\/\s@iconfont.*?\n/, '')
      if (~data.indexOf('@iconfont')) {
        data.replace(/@iconfont:\s*['"](.+)['"];/, (replace, url) => {
          if (url.indexOf('//') === 0) {
            url = 'https:' + url
          } else if (url.indexOf('http:') === 0) {
            url = url.replace('http:', 'https:')
          }
          https.get(url, res => {
            let content = ''
            res.on('error', err => {
              reject(err)
            })
            res.on('data', chunk => {
              content += chunk
            })
            res.on('end', () => {
              let match = content.match(
                new RegExp(`[\\s\\r\\n]*@font-face[\\s\\r\\n]*`)
              )
              match = match ? match[0] : undefined
              let replaceContent = match
                ? grabConfigFromScript(
                  content,
                  content.indexOf(match) + match.length
                )
                : false
              replaceContent.replace(/url\(['"]([\s\S]+?)['"]\)/, (c, url) => {
                if (url.indexOf('//') === 0) {
                  url = 'https:' + url
                } else if (url.indexOf('http:') === 0) {
                  url = url.replace('http:', 'https:')
                }
                url =
                  url.substr(0, url.lastIndexOf('.')) + '.ttf?t=' + Date.now()
                https.get(url, res => {
                  let chunks = []
                  res.on('error', err => {
                    reject(err)
                  })
                  res.on('data', chunk => {
                    chunks.push(chunk)
                  })
                  res.on('end', () => {
                    let base64 = Buffer.concat(chunks).toString('base64')
                    let font = `{font-family: 'iconfont';src: url(data:font/truetype;charset=utf-8;base64,#BASE64) format('truetype');font-weight: normal;font-style: normal;}`
                    font = font.replace('#BASE64', base64)
                    content = content.replace(replaceContent, font)
                    data = data.replace(replace, content)
                    data = data.replace(
                      /(\d+(\.{0,1}\d+){0,1})px/,
                      (a, b, c, d) => {
                        return a.replace(a, `${accMul(b, 2)}rpx`)
                      }
                    )
                    resolve(data)
                  })
                })
              })
            })
          })
        })
      } else {
        resolve(data)
      }
    } else {
      resolve(data)
    }
  })
}

function injectAbsoluteImports (data, imports, compiler) {
  let strImport = '\n'
  for (const path of imports) {
    strImport =
      strImport + `@import '${path.replace(compiler.options.dir, '')}';\n`
  }
  data = strImport + data
  return data
}

function injectFullPathImports (data, imports) {
  let strImport = '\n'
  for (const path of imports) {
    strImport = strImport + `@import (reference) '${path}';\n`
  }
  data = strImport + data
  return data
}

function compileData (data, styleInject = {}, imports, path, compiler) {
  if (
    styleInject.ext &&
    styleInject.imports &&
    styleInject.imports.length > 0
  ) {
    if (~path.indexOf(styleInject.ext)) {
      if (styleInject.include && styleInject.include.length > 0) {
        let [exitInclude, include] = [false, []]
        const includeType = _type(styleInject.include)
        if (includeType !== '[object Array]') {
          include.push(styleInject.include)
        } else {
          include = styleInject.include || []
        }
        for (let i = 0; i < include.length; i++) {
          if (_type(include[i]) === '[object RegExp]') {
            if (include[i].test(path)) {
              exitInclude = true
              break
            }
          } else {
            if (~path.indexOf(_dealPath(include[i]))) {
              exitInclude = true
              break
            }
          }
        }
        if (exitInclude) {
          styleInject.imports.forEach(item => {
            // 避免同名文件嵌套引用
            if (item !== path) {
              imports.add(item)
            }
          })
        }
      } else {
        styleInject.imports.forEach(item => {
          // 避免同名文件嵌套引用
          if (item !== path) {
            imports.add(item)
          }
        })
      }
    }
  }

  if (data) {
    data = data.replace(/\/\/\s*@import.*?\n/, '')
    const reg = /@import([\s\S]*?)["'](.+?)["'][\s\S]*?;/g
    data = data.replace(reg, function (m, t1, t2) {
      let fullPath
      if (/less/.test(t2)) {
        if (/^\//.test(t2)) {
          fullPath = compiler.options.dir + t2
        } else {
          fullPath = npath.resolve(npath.parse(path).dir, t2)
        }
        imports.add(fullPath)
      } else {
        console.warn(path, chalk.red('Only allow references to less files'))
      }
      return ''
    })
  }
  return data
}

export default function (data, loader, path, next, compiler) {
  if (
    !data &&
    !(
      compiler.options.styleInject &&
      compiler.options.styleInject.imports &&
      compiler.options.styleInject.imports.length > 0
    )
  ) {
    return next(null, data)
  }
  loadIconfont(data)
    .then(data => {
      const imports = new Set()
      data = compileData(
        data,
        compiler.options.styleInject,
        imports,
        path,
        compiler
      )
      data = injectFullPathImports(data, imports)
      loader.options = loader.options || {}
      loader.options.filename = path
      const loaderOptions = loaderUtils.getOptions({ query: loader.options })

      if (Object.prototype.hasOwnProperty.call(loaderOptions, 'path')) {
        delete loader.options.path
        console.warn(chalk.red('Please use data to compile!'))
      }
      if (Object.prototype.hasOwnProperty.call(loaderOptions, 'file')) {
        delete loader.options.file
        console.warn(chalk.red('Please use data to compile!'))
      }
      less
        .render(data, loaderOptions)
        .then(output => {
          next(null, injectAbsoluteImports(output.css, imports, compiler))
        })
        .catch(next)
    })
    .catch(next)
}
