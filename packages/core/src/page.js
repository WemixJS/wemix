/*
 * @Description: extends Page
 * @LastEditors: sanshao
 * @Date: 2019-04-05 20:45:45
 * @LastEditTime: 2019-06-06 17:56:51
 */
import { diffData, mergeData, filterData } from './util'
import { getComponent, getAllComponents } from './cache'
export default class {
  $init (wemix, $wxpage, pagePath, ...args) {
    this.__webviewId__ =
      $wxpage.__wxWebviewId__ ||
      $wxpage.$viewId ||
      $wxpage.__webviewId__ ||
      +new Date()
    this.data = this.data || {}
    this.options = args[0]
    this.route = `/${pagePath}`
    let strOpt = wemix.stringify(this.options, false)
    this.search = strOpt ? '?' + strOpt : strOpt
    this.setData = (data, func) => {
      if (!wemix.isObject(data)) {
        throw new Error('Data should be an ["object Object"]')
      }
      if (!wemix.isEmptyObject(data)) {
        const differData = {}
        diffData(wemix, differData, $wxpage.data, data, '')
        $wxpage.dispatchPropsKeys &&
          filterData(differData, $wxpage.dispatchPropsKeys)
        mergeData(wemix, differData, this.data)
        $wxpage.setData(differData, func)
      }
    }
    this.setProps = (data, func) => {
      if (!wemix.isObject(data)) {
        throw new Error('Data should be an ["object Object"]')
      }
      if (!wemix.isEmptyObject(data)) {
        const differData = {}
        diffData(wemix, differData, $wxpage.data, data, '')
        mergeData(wemix, differData, this.props)
        $wxpage.setData(differData, func)
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
  }
}
