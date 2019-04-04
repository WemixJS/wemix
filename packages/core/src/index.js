/*
 * @Description: wechat core
 * @LastEditors: sanshao
 * @Date: 2019-03-28 19:00:41
 * @LastEditTime: 2019-04-04 18:01:42
 */

import app from './app'
import page from './page'
import component from './component'
import Adapter from './wechat'
import util from './util'
const adapter = new Adapter()
class Wemix {
  $createApp (AppClass) {
    const [config, _this] = [{}, this]
    config['onLaunch'] = function (...args) {
      this.app = new AppClass()
      _this.$init(_this, AppClass)
    }
    Object.getOwnPropertyNames(AppClass.prototype || []).forEach(v => {
      if (
        v !== 'constructor' &&
        v !== 'onLaunch' &&
        v !== 'onLog' &&
        v !== 'onPageShow' &&
        v !== 'onPageHide'
      ) {
        config[v] = (...args) => {
          return _this[v] && _this[v].apply(_this, args)
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
      this.page.setData(util.extend(PageClass.data || {}, true))
      return this.page['onLoad'] && this.page['onLoad'].apply(this.page, args)
    }
    config['onShow'] = function (...args) {
      this.timestamp = Date.now()
      const app = getApp()
      app.app.onPageShow && app.app.onPageShow(args)
      return this.page['onShow'] && this.page['onShow'].apply(this.page, args)
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
  $createComponent () {
    return adapter.$createComponent()
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
  unparams (str) {
    let params = {}
    str = str.split('&')
    for (let i = 0; i < str.length; i++) {
      let item = str[i].split('=')
      params[item[0]] = item[1]
    }
    return params
  }
  params (obj, encode = true) {
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
  parseSearch (query) {
    let search = this.params(query, false)
    return search ? '?' + search : search
  }
}
const wemix = new Wemix()
wemix.app = app
wemix.page = page
wemix.component = component
export default wemix
