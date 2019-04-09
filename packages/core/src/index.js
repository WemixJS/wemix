/*
 * @Description: wechat core
 * @LastEditors: sanshao
 * @Date: 2019-03-28 19:00:41
 * @LastEditTime: 2019-04-09 14:30:52
 */

import app from './app'
import page from './page'
import Adapter from './wechat'
const adapter = new Adapter()
class Wemix {
  constructor () {
    this.app = app
    this.page = page
    this.component = adapter.getComponent()
  }
  $createApp (AppClass) {
    const [config, _this] = [{}, this]
    config['onLaunch'] = function (...args) {
      this.app = new AppClass()
      this.app.$init(_this, AppClass)
      this.app['onLaunch'] && this.app['onLaunch'].apply(this.app, args)
    }
    Object.getOwnPropertyNames(AppClass.prototype || []).forEach(v => {
      if (
        v !== 'constructor' &&
        v !== 'onLaunch' &&
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
    const pages = getCurrentPages()
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
}
export default new Wemix()
