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

    compiler.hooks.emit.tapAsync('ReplacePlugin', (compilation, cb) => {
      for (const distPath in compilation.modules) {
        let value = compilation.modules[distPath]
        if (
          /\.js$/.test(distPath) &&
          toString.call(value) === '[object String]'
        ) {
          for (let i = 0; i < re.length; i++) {
            value = value.replace(
              re[i].reg,
              typeof re[i].replaceValue === 'string'
                ? `"${re[i].replaceValue}"`
                : re[i].replaceValue
            )
          }
          compilation.modules[distPath] = value
        }
      }
      cb()
    })
  }
}
