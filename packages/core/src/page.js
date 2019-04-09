/*
 * @Description: extends Page
 * @LastEditors: sanshao
 * @Date: 2019-04-05 20:45:45
 * @LastEditTime: 2019-04-09 14:21:01
 */
import { diffData, mergeData } from './util'
export default class {
  $init (wemix, $wxpage, pagePath, ...args) {
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
        mergeData(wemix, differData, this.data)
        $wxpage.setData(differData, func)
      }
    }
  }
}
