/*
 * @Description: extends App
 * @LastEditors: sanshao
 * @Date: 2019-04-01 16:12:47
 * @LastEditTime: 2019-04-05 16:18:33
 */

export default class {
  $init (wemix, AppClass) {
    wemix.config = {
      app: AppClass.config,
      pages: {},
      components: {},
    }
  }
}
