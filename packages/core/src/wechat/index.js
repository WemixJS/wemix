/*
 * @Description: wechat core
 * @LastEditors: sanshao
 * @Date: 2019-03-28 19:00:41
 * @LastEditTime: 2019-04-09 14:36:15
 */

import { diffData, mergeData, filterData } from '../util'
export default class Wechat {
  $createComponent (ComponentClass, wemix) {
    const config = {
      methods: {},
    }
    config['properties'] = ComponentClass.properties
    config['created'] = function () {
      this.component = new ComponentClass()
      this.propsKeys = Object.keys(ComponentClass.properties || {})
      this.component.$init(wemix, this)
    }
    config['attached'] = function (...args) {
      this.component.setData(this.component.data)
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
        this.data = this.data || {}
        this.setData = (data, func) => {
          if (!wemix.isObject(data)) {
            throw new Error('Data should be an ["object Object"]')
          }
          if (!wemix.isEmptyObject(data)) {
            const differData = {}
            diffData(wemix, differData, $wxcomponent.data, data, '')
            filterData(differData, $wxcomponent.propsKeys)
            mergeData(wemix, differData, this.data)
            $wxcomponent.setData(differData, func)
          }
        }
        const defineObj = {}
        $wxcomponent.propsKeys.forEach(key => {
          defineObj[key] = {
            enumerable: true,
            configurable: true,
            get () {
              return $wxcomponent.data[key]
            },
          }
        })
        this.props = {}
        Object.defineProperties(this.props, defineObj)
        this.triggerEvent = (name, details) => {
          $wxcomponent.triggerEvent(name, details)
        }
      }
    }
  }
}
