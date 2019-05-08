/*
 * @Description: sass-loader
 * @LastEditors: sanshao
 * @Date: 2019-02-28 14:32:47
 * @LastEditTime: 2019-05-08 20:18:33
 */

import nodeSass from 'node-sass'
import semver from 'semver'
import https from 'https'
import loaderUtils from 'loader-utils'
import npath from 'path'
import chalk from 'chalk'

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

// 合并import
const _mergeImport = (data, path, loader, compiler, hash) => {
  const imports = []
  if (loader.imports && loader.imports.length > 0) {
    loader.imports.forEach(item => {
      if (item !== path) {
        imports.push(item)
      }
    })
  }

  data = data.replace(/@import\s*(["'])(.+?)\1;/g, function (
    word,
    word1,
    word2
  ) {
    let outWord
    if (/sass|scss/.test(word2)) {
      if (/^\//.test(word2)) {
        outWord = compiler.options.dir + word2
      } else {
        outWord = npath.resolve(npath.parse(path).dir, word2)
      }
      imports.push(outWord)
      return ''
    } else {
      console.log(chalk.red('Only allow references to scss files'))
      return word
    }
  })
  for (var i = 0; i < imports.length; i++) {
    if (!~hash.indexOf(imports[i])) {
      hash.push(imports[i])
    }
  }
  return data
}
// 处理imports
const _dealData = (imports, data) => {
  return (
    imports
      .map(item => {
        return `@import '${item}';`
      })
      .join('\n') +
    `\n.delete_flag{color:red;}\n` +
    data
  )
}

// 注入import
const _injectImport = (data, compiler, imports) => {
  const importsString = imports
    .map(item => {
      return `@import '${item.replace(compiler.options.dir, '')}';`
    })
    .join('\n')
  return data.replace(/[\s\S]*?\.delete_flag\s\{[\s\S]*?\}/, importsString)
}

export default function (data, loader, path, next, compiler) {
  if (
    !data &&
    (!loader.imports || (loader.imports && loader.imports.length <= 0))
  ) {
    return next(null, data)
  }
  if (!data && (loader.imports && loader.imports.length > 0)) {
    let importsPath = []
    loader.imports.forEach(item => {
      if (path !== item) {
        importsPath.push(`@import "${item.replace(compiler.options.dir, '')}";`)
      }
    })
    data = importsPath.join('\n') + data

    return next(null, data)
  }

  const { info } = nodeSass
  const components = info.split('\t')
  const version = components[1]
  if (components.length < 2) {
    next(`Unknown Sass implementation "${info}".`)
    return
  }

  if (!semver.satisfies(version, '^4.0.0')) {
    next(`Node Sass version ${version} is incompatible with ^4.0.0.`)
    return
  }

  if (data) {
    _promise(data)
      .then(data => {
        // return 合并import，将合并并去重且过滤掉与当前路径相同的path的数组
        const imports = []
        data = _mergeImport(data, path, loader, compiler, imports)
        data = _dealData(imports, data)
        const loaderOptions =
          (loader.options &&
            loaderUtils.getOptions({ query: loader.options })) ||
          {}
        try {
          const result = nodeSass.renderSync({
            data,
            ...loaderOptions,
          })
          let outCss = _injectImport(result.css.toString(), compiler, imports)
          next(null, outCss)
        } catch (error) {
          next(error)
        }
      })
      .catch(error => {
        next(error)
      })
  } else {
    next(null, data)
  }
}
