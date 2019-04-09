/*
 * @Description: wechat core
 * @LastEditors: sanshao
 * @Date: 2019-03-28 19:00:41
 * @LastEditTime: 2019-04-09 10:50:52
 */

import { diffData, mergeData } from '../util'

export default class Tt {
  $createComponent (ComponentClass) {
    const [config, _this] = [{ methods: {} }, this]
    config['data'] = _this.data || {}
    config['properties'] = ComponentClass.properties
    config['created'] = function () {
      this.component = new ComponentClass()
      this.component.$init(_this, this)
      this.triggerEvent('onRef', this.component)
    }
    config['attached'] = function (...args) {
      return (
        this.component['onLoad'] &&
        this.component['onLoad'].apply(this.component, args)
      )
    }
    config['detached'] = function (...args) {
      return (
        this.component['onUnload'] &&
        this.component['onUnload'].apply(this.component, args)
      )
    }
    Object.getOwnPropertyNames(ComponentClass.prototype || []).forEach(v => {
      if (
        v !== 'constructor' &&
        v !== 'onLoad' &&
        v !== 'onUnload' &&
        v !== 'onInit' &&
        v !== 'deriveDataFromProps' &&
        v !== 'didMount' &&
        v !== 'didUpdate' &&
        v !== 'didUnmount' &&
        v !== 'created' &&
        v !== 'attached' &&
        v !== 'ready' &&
        v !== 'moved' &&
        v !== 'detached'
      ) {
        config.methods[v] = function (...args) {
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
          return (
            this.component[v] && this.component[v].apply(this.component, args)
          )
        }
      }
    })
    return config
  }
  getComponent () {
    return class {
      $init (wemix, $wxcomponent) {
        this.data = Object.assign(this.data || {}, $wxcomponent.data)
        this.setData = (data, func) => {
          if (!wemix.isObject(data)) {
            throw new Error('Data should be an ["object Object"]')
          }
          const differData = {}
          diffData(wemix, differData, $wxcomponent.data, data, '')
          mergeData(wemix, differData, this.data)
          $wxcomponent.setData(differData, func)
        }
        this.triggerEvent = (name, details) => {
          $wxcomponent.triggerEvent(name, details)
        }
      }
    }
  }
}
