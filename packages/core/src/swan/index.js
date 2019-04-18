/*
 * @Description: wechat core
 * @LastEditors: sanshao
 * @Date: 2019-03-28 19:00:41
 * @LastEditTime: 2019-04-17 15:52:20
 */

import { diffData, mergeData, filterData } from '../util'
import {
  setComponent,
  deleteComponent,
  getComponent,
  getAllComponents,
} from '../cache'
import {
  SWAN_UNSUPPORTED_API_WARNING,
  SWAN_UNSUPPORTED_API,
} from '../constants'

export default class Swan {
  constructor () {
    this.nativeApi = swan
    this.unsupportedApi = SWAN_UNSUPPORTED_API
    this.unsupportedApiWarning = SWAN_UNSUPPORTED_API_WARNING
  }
  $createComponent (ComponentClass, wemix) {
    const config = {
      methods: {},
    }
    config['properties'] = Object.assign(
      { wemixCopyId: { type: String, value: '' } },
      { wemixCopyClass: { type: String, value: '' } },
      ComponentClass.properties || {}
    )
    config['created'] = function () {
      this.component = new ComponentClass()
      this.propsKeys = Object.keys(config['properties'])
      this.component.$init(wemix, this)
    }
    config['attached'] = function (...args) {
      const pages = getCurrentPages()
      this.component.setData(this.component.data)
      this.component.__webviewId__ = pages[pages.length - 1].__webviewId__
      this.component.__exparserNodeId__ = this.nodeId
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
    config['detached'] = function (...args) {
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
  getShareAppMessage (result) {
    return {
      title: result.title,
      content: result.desc,
      path: result.path,
      imageUrl: result.imageUrl,
      success: result.success,
      fail: result.fail,
    }
  }
  showToast (content) {
    this.nativeApi.showToast({
      title: content,
      icon: 'none',
    })
  }
  showLoading (content) {
    this.nativeApi.showLoading({
      title: content || '加载中...',
    })
  }
  showModal (params) {
    this.nativeApi.showModal({
      title: params.title || '',
      content: params.content || '小电科技',
      showCancel:
        typeof params.showCancel === 'boolean' ? params.showCancel : false,
      cancelText: params.cancelText || '取消',
      cancelColor: params.cancelColor || '#000000',
      confirmText: params.confirmText || '确定',
      confirmColor: params.confirmColor || '#3c76ff',
      success: res => {
        if (res.confirm) {
          params.success && params.success()
        } else if (res.cancel) {
          params.cancel && params.cancel()
        }
      },
    })
  }
}
