const path = require('path')
const WechatPlugin = require('@wemix/wechat-plugin').default

module.exports = {
  entryDir: path.join(__dirname, 'src'),
  outputDir: path.join(__dirname, 'dist'),
  resolve: {
    alias: {
      pages: path.join(__dirname, 'src/pages'),
      components: path.join(__dirname, 'src/components'),
      assets: path.join(__dirname, 'src/assets'),
      utils: path.join(__dirname, 'src/utils'),
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        encoding: 'utf-8',
        include: [
          path.resolve(__dirname, 'node_modules/@rematch/core'),
          path.resolve(__dirname, 'node_modules/@rematch/loading'),
          path.resolve(__dirname, 'src'),
        ],
        use: [
          {
            loader: '@wemix/babel-loader',
            options: {
              configFile: path.resolve('babel.config.js'),
            },
          },
        ],
      },
      {
        test: /\.less$/,
        encoding: 'utf-8',
        use: [
          { loader: '@wemix/css-loader' },
          {
            loader: '@wemix/postcss-loader',
            options: {
              configFile: path.resolve('postcss.config.js'),
            },
          },
          { loader: '@wemix/less-loader' },
        ],
      },
      {
        test: /\.html/,
        encoding: 'utf-8',
      },
      {
        test: /\.json/,
        encoding: 'utf-8',
      },
    ],
  },
  plugins: [
    new WechatPlugin(),
  ],
}
