const path = require('path')
const TransformPlugin = require('@wemix/transform-plugin')

module.exports = {
  entry: [
    path.join(__dirname, 'src/app.js'),
    path.join(__dirname, 'src/assets'),
  ],
  loaders: [
    {
      test: /\.js$/,
      include: [
        path.join(__dirname, 'src'),
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
      imports: [path.join(__dirname, 'src/global.less')],
      use: [
        {
          loader: '@wemix/postcss-loader',
          options: {
            configFile: path.resolve('postcss.config.js'),
          },
        },
        { loader: '@wemix/less-loader' },
      ],
    },
  ],
  plugins: [new TransformPlugin()],
}
