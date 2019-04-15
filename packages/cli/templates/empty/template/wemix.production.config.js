const baseConfig = require('./wemix.base.config')
const imageminJpegtran = require('imagemin-jpegtran')
const imageminPngquant = require('imagemin-pngquant')
const UglifyjsPlugin = require('@wemix/uglifyjs-plugin')
const UglifyimgPlugin = require('@wemix/uglifyimg-plugin')
const PrettyPlugin = require('@wemix/pretty-plugin')

module.exports = Object.assign(baseConfig, {
  plugins: baseConfig.plugins.concat([
    new PrettyPlugin(),
    new UglifyjsPlugin(),
    new UglifyimgPlugin({
      plugins: [
        imageminJpegtran(),
        imageminPngquant({
          quality: [0.6, 0.8],
        }),
      ],
    }),
  ]),
})
