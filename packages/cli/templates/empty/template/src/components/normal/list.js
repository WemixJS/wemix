import wemix from '@wemix/core'

/**
 * 类名不要使用Page字段
 */
export default class List extends wemix.component {
  constructor () {
    super()
    this.data = {}
  }
  onLoad () { }
  onUnload () { }
}
List.config = {
  components: true,
  usingComponents: {
  },
}
List.properties = {}
