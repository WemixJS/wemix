export default class ReplacePlugin {
  constructor (options) {
    this.options = options
  }
  apply (compiler) {
    const definitions = this.options
    let re = []
    const walkOptions = (definitions, prefix) => {
      Object.keys(definitions).forEach(key => {
        const code = definitions[key]
        if (code && typeof code === 'object') {
          walkOptions(code, prefix + key + '.')
          return
        }
        applyReplaceKey(code, prefix + key)
      })
    }
    const applyReplaceKey = (code, key) => {
      re.push({
        reg: new RegExp(key, 'g'),
        replaceValue: code,
      })
    }
    walkOptions(definitions, '')
    compiler.hooks.beforeSingleCompile.tapAsync(
      'DefinePlugin',
      (data, path, cb) => {
        if (/\.js$/.test(path)) {
          for (let i = 0; i < re.length; i++) {
            data = data.replace(re[i].reg, re[i].replaceValue)
          }
          cb(null, data)
        } else {
          cb(null, data)
        }
      }
    )
  }
}
