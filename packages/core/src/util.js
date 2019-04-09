/*
 * @Description: util
 * @LastEditors: sanshao
 * @Date: 2019-04-05 20:43:27
 * @LastEditTime: 2019-04-05 22:51:37
 */

const parseKey = function (e) {
  for (
    var t = e.length, n = [], o = '', r = 0, i = !1, a = !1, u = 0;
    u < t;
    u++
  ) {
    var c = e[u]
    if (c === '\\') {
      if (
        u + 1 < t &&
        (e[u + 1] === '.' ||
          e[u + 1] === '[' ||
          e[u + 1] === ']' ||
          e[u + 1] === '\\')
      ) {
        o += e[u + 1]
        u++
      } else {
        o += '\\'
      }
    } else if (c === '.') {
      if (o) {
        n.push(o)
        o = ''
      }
    } else if (c === '[') {
      if ((o && (n.push(o), (o = '')), n.length === 0)) {
        throw new Error('The path string should not start with []: ' + e)
      }
      a = !0
      i = !1
    } else if (c === ']') {
      if (!i) {
        throw new Error(
          'There should be digits inside [] in the path string: ' + e
        )
      }
      a = !1
      n.push(r)
      r = 0
    } else if (a) {
      if (c < '0' || c > '9') {
        throw new Error(
          'Only digits (0-9) can be put inside [] in the path string: ' + e
        )
      }
      i = !0
      r = 10 * r + c.charCodeAt(0) - 48
    } else {
      o += c
    }
  }
  if ((o && n.push(o), t === 0)) {
    throw new Error('The path string should not be empty')
  }
  return n
}
// 数组没有做diff，成本太大
export const diffData = function (wemix, differData, wxData, data, lastDotKey) {
  let cacheWXData = wxData
  let cacheData = data
  for (const key in cacheData) {
    let newDotKey = lastDotKey + key
    if (wemix.isObject(cacheData[key])) {
      if (wemix.isObject(cacheWXData[key])) {
        diffData(wemix, differData, cacheWXData[key], cacheData[key], newDotKey)
      } else {
        differData[newDotKey] = cacheData[key]
      }
    } else if (wemix.isArray(cacheData[key])) {
      differData[newDotKey] = cacheData[key]
    } else if (
      wemix.isNumber(cacheData[key]) ||
      wemix.isNull(cacheData[key]) ||
      wemix.isBoolean(cacheData[key]) ||
      wemix.isString(cacheData[key]) ||
      wemix.isSymbol(cacheData[key])
    ) {
      if (cacheWXData[key] !== cacheData[key]) {
        differData[newDotKey] = cacheData[key]
      }
    }
  }
}

export const mergeData = function (wemix, differData, data) {
  for (let key in differData) {
    const keys = parseKey(key)
    let cache = data
    for (let i = 0; i < keys.length; i++) {
      if (keys.length - i === 1) {
        cache[keys[i]] = differData[key]
      } else {
        if (cache[keys[i]] === undefined) {
          if (wemix.isNumber(keys[i + 1])) {
            cache[keys[i]] = []
          } else {
            cache[keys[i]] = {}
          }
        }
        cache = cache[keys[i]]
      }
    }
  }
}
