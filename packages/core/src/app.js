/*
 * @Description: extends App
 * @LastEditors: sanshao
 * @Date: 2019-04-01 16:12:47
 * @LastEditTime: 2019-04-01 17:54:37
 */

export default class {
  $init (wemix, AppClass) {
    wemix.route = {
      previous: {},
      current: {},
    }
    wemix.config = {
      app: AppClass.config,
      pages: {},
      components: {},
    }
  }
}
