import wemix from '@wemix/core'

/**
 * 类名不要使用Page字段
 */
export default class Login extends wemix.component {
  constructor () {
    super()
    this.data = {}
  }
  onLoad () { }
  onUnload () { }
}
Login.config = {
  components: true,
  usingComponents: {
  },
}
Login.properties = {}
