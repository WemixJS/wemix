const postcssPresetEnv = require('postcss-preset-env')
const cssnano = require('cssnano')

module.exports = {
  ident: 'postcss',
  plugins: [
    postcssPresetEnv({
      stage: 0,
      browsers: [
        'Chrome >= 35',
        'ChromeAndroid >= 35',
        'iOS >= 8',
        'Android >= 4.1',
      ],
    }),
    cssnano({
      preset: 'default',
      autoprefixer: false,
      reduceIdents: false,
      'postcss-zindex': false,
    }),
  ],
}
