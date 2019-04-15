const path = require('path')
const TransformPlugin = require('@wemix/transform-plugin')
console.log(TransformPlugin)

module.exports = {
  entry: [
    path.join(__dirname, 'src/app.js'),
    path.join(__dirname, 'src/assets'),
  ],
  loaders: [
    {
      test: /\.js$/,
      include: [
        path.join(__dirname, 'node_modules/@rematch/core'),
        path.join(__dirname, 'node_modules/@rematch/loading'),
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
    {
      test: /\.css$/,
      use: [
        {
          loader: '@wemix/postcss-loader',
          options: {
            configFile: path.resolve('postcss.config.js'),
          },
        },
      ],
    },
  ],
  plugins: [new TransformPlugin()],
}
