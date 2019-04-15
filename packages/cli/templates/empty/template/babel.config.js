module.exports = function (api) {
  api.cache(true)
  const presets = [
    [
      '@babel/preset-env',
      {
        debug: false,
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
        corejs: { version: 2, proposals: true },
        modules: 'commonjs',
      },
    ],
  ]
  const plugins = [
    [
      '@babel/plugin-transform-runtime',
      {
        absoluteRuntime: false,
        corejs: false,
        helpers: true,
        regenerator: true,
        useESModules: false,
      },
    ],
  ]
  return {
    sourceMap: true,
    presets,
    plugins,
  }
}
