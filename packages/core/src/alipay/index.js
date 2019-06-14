/*
 * @Description: wechat core
 * @LastEditors: sanshao
 * @Date: 2019-03-28 19:00:41
 * @LastEditTime: 2019-06-14 13:48:09
 */

import { diffData, mergeData, filterData } from '../util'
import {
  setComponent,
  deleteComponent,
  getComponent,
  getAllComponents,
} from '../cache'
import { ALI_UNSUPPORTED_API_WARNING, ALI_UNSUPPORTED_API } from '../constants'

export default class Alipay {
  constructor () {
    this.nativeApi = my
    this.unsupportedApi = ALI_UNSUPPORTED_API
    this.unsupportedApiWarning = ALI_UNSUPPORTED_API_WARNING
  }
  $createComponent (ComponentClass, wemix) {
    const config = {
      methods: {},
    }
    let dataComponent = new ComponentClass()
    // 只支持常规的几种数据格式，所以这里简单的做parse处理
    config['data'] = JSON.parse(JSON.stringify(dataComponent.data || {}))
    dataComponent = null
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
      // rematch data hack
      this.$initRematch && this.$initRematch.call(this.component)
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
  getShareAppMessage (result) {
    return {
      title: result.title,
      desc: result.desc,
      path: result.path,
      content: result.content,
      bgImgUrl: result.bgImgUrl,
      imageUrl: result.imageUrl,
      success: result.success,
      fail: result.fail,
    }
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
            filterData(
              differData,
              []
                .concat($wxcomponent.propsKeys)
                .concat($wxcomponent.dispatchPropsKeys)
            )
            mergeData(wemix, differData, this.data)
            $wxcomponent.setData(differData, func)
          }
        }
        this.setProps = (data, func) => {
          if (!wemix.isObject(data)) {
            throw new Error('Data should be an ["object Object"]')
          }
          if (!wemix.isEmptyObject(data)) {
            const differData = {}
            diffData(wemix, differData, $wxcomponent.data, data, '')
            mergeData(wemix, differData, this.props)
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
  showToast (params) {
    params.content = params.title
    params.type = params.icon
    this.nativeApi.showToast(params)
  }
  showLoading (params) {
    params.content = params.title
    this.nativeApi.showLoading(params)
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
  showActionSheet (params) {
    params.items = params.itemList
    this.nativeApi.showActionSheet(params)
  }
  // 图片
  saveImageToPhotosAlbum (params) {
    params.url = params.filePath
    this.nativeApi.saveImage(params)
  }
  compressImage (params) {
    params.apFilePaths = [params.src]
    params.compressLevel = params.quality
    this.nativeApi.compressImage(params)
  }
  // 数据存储
  setStorageSync (key, data) {
    this.nativeApi.setStorageSync({ key, data })
  }
  removeStorageSync (key) {
    this.nativeApi.removeStorageSync({ key })
  }
  getStorageSync (key) {
    return this.nativeApi.getStorageSync({ key })
  }
  // 导航栏
  setNavigationBarTitle (params) {
    this.nativeApi.setNavigationBar(params)
  }
  setNavigationBarColor (params) {
    this.nativeApi.setNavigationBar(params)
  }
  // 网络
  request (params) {
    params.headers = params.header
    this.nativeApi.request(params)
  }
  // 用户信息
  getUserInfo (params) {
    params.success = userInfo => {
      params.success({ userInfo })
    }
    this.nativeApi.getAuthUserInfo(params)
  }
}
