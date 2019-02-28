const npath = require('path')
const postcssPresetEnv = require('postcss-preset-env')
const cssnano = require('cssnano')
const prod = process.env.NODE_ENV === 'production'

const babel = {
  presets: [
    [
      '@babel/preset-env',
      {
        debug: true,
        targets: {
          chrome: '35',
          ios: '8',
          android: '4.1',
          browsers: [
            'Chrome >= 35',
            'ChromeAndroid >= 35',
            'iOS >= 8',
            'Android >= 4.1',
          ],
        },
        useBuiltIns: 'usage',
        modules: 'commonjs',
      },
    ],
  ],
  plugins: [
  ],
}

const less = {}

const postcss = {
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
  ],
}

let plugins = []

if (prod) {
  plugins = Object.assign(plugins, {
    uglifyjs: {
      filter: /\.js$/,
      config: {},
    },
    imagemin: {
      filter: /\.(jpg|png|jpeg)$/,
      config: {
        jpg: {
          quality: 80,
        },
        png: {
          quality: 80,
        },
      },
    },
  })
  postcss.plugins.push(cssnano({
    preset: 'default',
    autoprefixer: false,
    reduceIdents: false,
    'postcss-zindex': false,
  }))
}

module.exports = {
  static: 'assets',
  resolve: {
    alias: {
      pages: npath.join(__dirname, 'src/pages'),
      components: npath.join(__dirname, 'src/components'),
      assets: npath.join(__dirname, 'src/assets'),
      utils: npath.join(__dirname, 'src/utils'),
    },
    extensions: ['.js', '.json'],
    modules: ['node_modules'],
  },
  compilers: {
    less: less,
    postcss: postcss,
    babel: babel,
  },
  plugins: plugins,
}
