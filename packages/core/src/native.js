// cli 动态注入
const env = ''
let adapter

switch (env) {
  case 'alipay':
    adapter = require('./alipay')
    break
  case 'swan':
    adapter = require('./swan')
    break
  case 'tt':
    adapter = require('./tt')
    break
  default:
    adapter = require('./wechat')
}

export default adapter
