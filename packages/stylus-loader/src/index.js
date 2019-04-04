/*
 * @Description: stylus-loader
 * @LastEditors: sanshao
 * @Date: 2019-02-28 14:32:47
 * @LastEditTime: 2019-03-27 10:11:17
 */
import https from 'https'
import stylus from 'stylus'

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
  if (~data.indexOf('@import')) {
    data = data.replace(/@import\s*(["'])(.+?)\1;/g, function (word) {
      imports.push(word)
      return ''
    })
    return data
  } else {
    return data
  }
}
export default function (data, loader, path, next) {
  if (data) {
    _promise(data).then(data => {
      const imports = []
      data = _handleImport(data, imports)
      const instance = stylus(data)

      instance.render((err, css) => {
        if (err) {
          next(err)
        }
        next(null, css)
      })
    })
  } else {
    next(null, data)
  }
}
