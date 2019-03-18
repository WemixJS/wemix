/*
 * @Description: less-loader
 * @LastEditors: sanshao
 * @Date: 2019-02-28 14:32:47
 * @LastEditTime: 2019-03-18 21:23:03
 */

import less from 'less'
import chalk from 'chalk'
import https from 'https'
import loaderUtils from 'loader-utils'

const accMul = (arg1, arg2) => {
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

const grabConfigFromScript = (str, n) => {
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

// promise
const _promise = data => {
  return new Promise((resolve, reject) => {
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
              new RegExp(`[\\s\\r\\n]@font-face[\\s\\r\\n]*`)
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
              url = url.substr(0, url.lastIndexOf('.')) + '.ttf?t=' + Date.now()
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
  })
}

// 处理import
const _handleImport = (data, imports) => {
  let hasImport = true
  while (hasImport) {
    let length = 0
    if (~data.indexOf('@import') && ~data.indexOf('.less')) {
      let _import = data.substring(
        data.indexOf('@import'),
        data.indexOf('.less') + 5
      )
      length = _import.length
      let close = data.substr(data.indexOf('.less') + 5, 1)
      if (close === "'" || close === '"') {
        _import += close
        length++
        let end = data.substr(data.indexOf('.less') + 6, 1)
        if (end === ';') {
          length++
          _import += end
        }
      }
      data = data.substr(length + 1)
      imports.push(_import)
      return data
    } else {
      hasImport = false
      return data
    }
  }
}

export default function (data, config, path, next) {
  if (!data) {
    return next(null, data)
  }
  _promise(data).then(data => {
    const imports = []
    data = _handleImport(data, imports)
    const loaderOptions =
      (config.options && loaderUtils.getOptions({ query: config.options })) ||
      {}

    if (Object.prototype.hasOwnProperty.call(loaderOptions, 'path')) {
      delete config.options.path
      console.warn(chalk.red('Please use data to compile!'))
    }
    if (Object.prototype.hasOwnProperty.call(loaderOptions, 'file')) {
      delete config.options.file
      console.warn(chalk.red('Please use data to compile!'))
    }

    less
      .render(data, loaderOptions)
      .then(output => {
        output.css =
          imports.join('\n') + (imports.length ? '\n' + output.css : output.css)
        next(null, output.css)
      })
      .catch(e => {
        next(null, e)
      })
  })
}
