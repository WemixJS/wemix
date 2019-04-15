/*
 * @Description: sass-loader
 * @LastEditors: sanshao
 * @Date: 2019-02-28 14:32:47
 * @LastEditTime: 2019-03-27 10:11:10
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
let re = []
const _handleImport = (data, imports, path, loader, compiler) => {
  if (~data.indexOf('@import')) {
    data.replace(/@import\s*(["'])(.+?)\1[;|\n]/g, function (word) {
      imports.push(word)
    })
  }
  let [base, importPath, importSrcPath] = [[], [], '']
  if (loader.imports && loader.imports.length > 0) {
    for (let i = 0; i < loader.imports.length; i++) {
      const relative = npath.relative(npath.dirname(path), compiler.options.dir)
      if (relative) {
        importSrcPath = relative + '/' + npath.basename(loader.imports[i])
      } else {
        importSrcPath = './' + npath.basename(loader.imports[i])
      }
      re.push(new RegExp(npath.basename(loader.imports[i])))
      importPath.push('@import ' + `"${importSrcPath}";` + '\n')

      base.push(npath.basename(loader.imports[i]))
    }
    re.forEach(element => {
      if (!element.test(path)) {
        data = importPath.join('\n') + data
      }
    })
  }
  if (~data.indexOf('@import')) {
    data = data.replace(/@import\s*(["'])(.+?)\1[;|\n]/g, function (
      word,
      word1,
      word2
    ) {
      if (!/;/.test(word)) {
        word = word.replace('\n', function () {
          return ';\n'
        })
      }
      let outWord
      if (/sass|scss/.test(word2)) {
        if (/^\//.test(word2)) {
          outWord = '@import ' + `"${compiler.options.dir + word2}";` + '\n'
        } else {
          outWord =
            '@import ' +
            `"${npath.resolve(npath.parse(path).dir, word2)}";` +
            '\n'
        }
        return outWord
      } else {
        console.log(chalk.red('Only allow references to scss files'))
        return ''
      }
    })
    let [arr, hash] = [[], []]
    data = data.replace(/@import\s*(["'])(.+?)\1;/g, function (words) {
      arr.push(words)
      return ''
    })
    for (var i = 0; i < arr.length; i++) {
      if (hash.indexOf(arr[i]) === -1) {
        hash.push(arr[i])
      }
    }
    data = hash.join('\n') + data
    return data
  } else {
    return data
  }
}

const _filterImport = data => {
  if (~data.indexOf('@import')) {
    data = data.replace(/@import\s*(["'])(.+?)\1;/g, function (words) {
      return ''
    })
  } else {
    return data
  }
}

export default function (data, loader, path, next, compiler) {
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
    let ipath = []
    data.replace(/@import\s*(["'])(.+?)\1[;|\n]/g, function (word) {
      ipath.push(word)
    })
    data = `.delete_flag{color:red;}` + data
    data = ipath.join('\n') + data
    _promise(data).then(data => {
      const imports = []
      data = _handleImport(data, imports, path, loader, compiler)
      console.log(555555, data)
      const loaderOptions =
        (loader.options && loaderUtils.getOptions({ query: loader.options })) ||
        {}
      try {
        const result = nodeSass.renderSync({
          data,
          ...loaderOptions,
        })
        let outCss = result.css
          .toString()
          .replace(/[\s\S]*?\.delete_flag\s\{[\s\S]*?\}/, '')
        outCss = _filterImport(outCss)
        outCss = imports.join('\n') + (imports.length ? '\n' + outCss : outCss)
        next(null, outCss)
      } catch (error) {
        next(error)
      }
    })
  } else {
    next(null, data)
  }
}
