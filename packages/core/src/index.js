/*
 * @Description: wechat core
 * @LastEditors: sanshao
 * @Date: 2019-03-28 19:00:41
 * @LastEditTime: 2019-04-18 11:56:17
 */

import app from './app'
import page from './page'
import Adapter from './wechat'
import { deleteAllComponents } from './cache'
import { NATIVE_API } from './constants'
const adapter = new Adapter()
class Wemix {
  constructor () {
    this.app = app
    this.component = adapter.getComponent()
    this.page = page
    this.wx = adapter.nativeApi
    this.my = adapter.nativeApi
    this.tt = adapter.nativeApi
    this.swan = adapter.nativeApi
    this.config = {
      app: undefined,
      pages: {},
    }
  }
  $createApp (AppClass) {
    const [config, _this] = [{}, this]
    this.config.app = AppClass.config
    config['onLaunch'] = function (...args) {
      if (!this.app) {
        this.app = new AppClass()
        this.app.$init(_this, AppClass)
      }
      this.app['onLaunch'] && this.app['onLaunch'].apply(this.app, args)
    }
    config['onShow'] = function (...args) {
      if (!this.app) {
        this.app = new AppClass()
        this.app.$init(_this, AppClass)
      }
      this.app['onShow'] && this.app['onShow'].apply(this.app, args)
    }
    Object.getOwnPropertyNames(AppClass.prototype || []).forEach(v => {
      if (
        v !== 'constructor' &&
        v !== 'onLaunch' &&
        v !== 'onShow' &&
        v !== 'onLog' &&
        v !== 'onPageShow' &&
        v !== 'onPageHide'
      ) {
        config[v] = function (...args) {
          return this.app[v] && this.app[v].apply(this.app, args)
        }
      }
    })
    return config
  }
  $createPage (PageClass, pagePath) {
    const [config, _this] = [{}, this]
    _this.config.pages[`/${pagePath}`] = PageClass.config
    config['onLoad'] = function (...args) {
      this.page = new PageClass()
      this.page.$init(_this, this, pagePath, ...args)
      this.page.setData(this.page.data)
      return this.page['onLoad'] && this.page['onLoad'].apply(this.page, args)
    }
    config['onShow'] = function (...args) {
      this.timestamp = Date.now()
      const app = getApp()
      const page =
        this.page['onShow'] && this.page['onShow'].apply(this.page, args)
      app.app.onPageShow && app.app.onPageShow(args)
      return page
    }
    config['onHide'] = function (...args) {
      const tp = Date.now() - this.timestamp
      const app = getApp()
      const hide =
        this.page['onHide'] && this.page['onHide'].apply(this.page, args)
      app.app.onPageHide && app.app.onPageHide(tp)
      return hide
    }
    config['onUnload'] = function (...args) {
      deleteAllComponents(this.page.__webviewId__)
      const tp = Date.now() - this.timestamp
      const app = getApp()
      const unload =
        this.page['onUnload'] && this.page['onUnload'].apply(this.page, args)
      app.app.onPageHide && app.app.onPageHide(tp)
      return unload
    }
    Object.getOwnPropertyNames(PageClass.prototype || []).forEach(v => {
      if (
        v !== 'constructor' &&
        v !== 'onLoad' &&
        v !== 'onShow' &&
        v !== 'onHide' &&
        v !== 'onUnload'
      ) {
        if (v === 'onShareAppMessage') {
          config[v] = function (...args) {
            const result = this.page[v] && this.page[v].apply(this.page, args)
            return adapter.getShareAppMessage(result)
          }
        } else {
          config[v] = function (...args) {
            let formId, data
            const e = args && args[0]
            const app = getApp()
            if (e && e.type && e.currentTarget) {
              Object.keys(e.currentTarget.dataset).forEach(key => {
                if (/^wemixlog/.test(key)) {
                  if (!data) {
                    data = {}
                  }
                  data[
                    key.substr(8).replace(/( |^)[A-Z]/g, L => L.toLowerCase())
                  ] = e.currentTarget.dataset[key]
                }
              })
            }
            if (e && e.type === 'submit' && e.detail && e.detail.formId) {
              formId = e.detail.formId
            }
            if ((data || formId) && app.app.onLog) {
              app.app.onLog(e.type, formId, data)
            }
            return this.page[v] && this.page[v].apply(this.page, args)
          }
        }
      }
    })
    return config
  }
  $createComponent (ComponentClass, pagePath) {
    return adapter.$createComponent(ComponentClass, this)
  }
  getApp () {
    return getApp().app
  }
  getCurrentPages () {
    const pages = getCurrentPages() || []
    return pages.map(page => {
      return page.page
    })
  }
  parse (str, decode = true) {
    let params = {}
    str = str.split('&')
    for (let i = 0; i < str.length; i++) {
      let item = str[i].split('=')
      if (decode) {
        params[item[0]] = decodeURIComponent(item[1])
      } else {
        params[item[0]] = item[1]
      }
    }
    return params
  }
  stringify (obj, encode = true) {
    let str = []
    for (let k in obj) {
      if (typeof obj[k] !== 'undefined') {
        if (encode) {
          str.push(k + '=' + encodeURIComponent(obj[k]))
        } else {
          str.push(k + '=' + obj[k])
        }
      }
    }
    return str.join('&')
  }
  isString (str) {
    return toString.call(str) === '[object String]'
  }
  isArray (arr) {
    return toString.call(arr) === '[object Array]'
  }
  isBoolean (bool) {
    return toString.call(bool) === '[object Boolean]'
  }
  isUndefined (bool) {
    return toString.call(bool) === '[object Undefined]'
  }
  isNull (bool) {
    return toString.call(bool) === '[object Null]'
  }
  isNumber (num) {
    return toString.call(num) === '[object Number]'
  }
  isObject (obj) {
    return toString.call(obj) === '[object Object]'
  }
  isEmptyObject (obj) {
    if (!this.isObject(obj)) {
      return false
    }
    for (const n in obj) {
      if (obj.hasOwnProperty(n) && obj[n]) {
        return false
      }
    }
    return true
  }
  isFunction (arg) {
    return toString.call(arg) === '[object Function]'
  }
  isSymbol (sym) {
    return toString.call(sym) === '[object Symbol]'
  }
  compareVersion (baseVersion, currentVersion) {
    baseVersion = baseVersion.split('.')
    currentVersion = currentVersion.split('.')
    let len = Math.max(baseVersion.length, currentVersion.length)

    while (baseVersion.length < len) {
      baseVersion.push('0')
    }
    while (currentVersion.length < len) {
      currentVersion.push('0')
    }

    for (let i = 0; i < len; i++) {
      let num1 = parseInt(baseVersion[i])
      let num2 = parseInt(currentVersion[i])

      if (num1 > num2) {
        return 1
      } else if (num1 < num2) {
        return -1
      }
    }

    return 0
  }
}

const wemix = new Wemix()
NATIVE_API.forEach(key => {
  if (~adapter.unsupportedApi.indexOf(key)) {
    wemix[key] = function () {
      console.warn(`${adapter.unsupportedApiWarning} ${key}`)
    }
  } else {
    let method
    if (adapter.hasOwnProperty(key)) {
      method = adapter[key]
    } else {
      method = adapter.nativeApi[key]
    }
    wemix[key] = function (params) {
      if (wemix.isFunction(params.fail)) {
        const fail = params.fail
        params.fail = function (err) {
          const res = {}
          res.errMsg = err.errMsg || err.errorMessage
          res.code = err.code || err.error || err.errCode
          if (key === 'request') {
            res.statusCode = err.statusCode || err.status
          }
          fail(res)
        }
      }
      method(params)
    }
  }
})
export default wemix
