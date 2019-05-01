const baseConfig = require('./wemix.base.config')

module.exports = Object.assign(baseConfig, {
  env: 'development',
  plugins: baseConfig.plugins.concat([]),
})
