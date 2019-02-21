import wemix from 'wemix'

/**
 * 类名不要使用Page字段
 */
export default class Index extends wemix.page {
  onLoad (options) {}
  onShow () {}
  onHide () {}
  onUnload () {}
}

Index.data = {}

Index.config = {
  navigationbartitletext: 'wemix',
  usingcomponents: {},
}
