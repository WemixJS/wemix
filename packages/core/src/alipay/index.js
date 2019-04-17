/*
 * @Description: wechat core
 * @LastEditors: sanshao
 * @Date: 2019-03-28 19:00:41
 * @LastEditTime: 2019-04-16 11:41:44
 */

import { diffData, mergeData, filterData } from '../util'
import {
  setComponent,
  deleteComponent,
  getComponent,
  getAllComponents,
} from '../cache'
export default class Alipay {
  constructor () {
    this.nativeApi = my
  }
  $createComponent (ComponentClass, wemix) {
    const config = {
      methods: {},
    }
    config['props'] = Object.assign(
      { wemixCopyId: { type: String, value: '' } },
      { wemixCopyClass: { type: String, value: '' } },
      ComponentClass.properties || {}
    )
    config['didMount'] = function (...args) {
      this.component = new ComponentClass()
      this.propsKeys = Object.keys(config['props'])
      this.component.$init(wemix, this)
      this.component.setData(this.component.data)
      this.component.__webviewId__ = this.$page.$viewId
      this.component.__exparserNodeId__ = this.$id
      if (
        this.component.props.wemixCopyId ||
        this.component.props.wemixCopyClass
      ) {
        setComponent(
          this.component.props.wemixCopyId,
          this.component.props.wemixCopyClass,
          this.component
        )
      }
      return (
        this.component['onLoad'] &&
        this.component['onLoad'].apply(this.component, args)
      )
    }
    config['didUnmount'] = function (...args) {
      const unload =
        this.component['onUnload'] &&
        this.component['onUnload'].apply(this.component, args)
      deleteComponent(this.component.__webviewId__, this.__exparserNodeId__)
      return unload
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
        this.selectComponent = function (selector) {
          if (selector) {
            return getComponent(this.__webviewId__, selector)
          }
        }
        this.selectAllComponents = function (selector) {
          return getAllComponents(this.__webviewId__, selector)
        }
        this.props = $wxcomponent.props
        this.triggerEvent = (name, details) => {
          $wxcomponent.props[`on${name}`]({ detail: details })
        }
      }
    }
  }
  showToast (content) {
    this.nativeApi.showToast({
      content: content,
      type: 'none',
    })
  }
  showLoading (content) {
    this.nativeApi.showLoading({
      content: content || '加载中...',
    })
  }
  showModal (params) {
    if (typeof params.showCancel === 'undefined' || !params.showCancel) {
      this.nativeApi.alert({
        title: params.title || '',
        content: params.content || '小电科技',
        buttonText: params.confirmText || '确定',
        success: res => {
          params.success && params.success()
        },
      })
    } else {
      this.nativeApi.confirm({
        title: params.title || '',
        content: params.content || '小电科技',
        confirmButtonText: params.confirmText || '确定',
        cancelButtonText: params.cancelText || '取消',
        success: confirm => {
          if (confirm) {
            params.success && params.success()
          } else {
            params.cancel && params.cancel()
          }
        },
      })
    }
  }
}
