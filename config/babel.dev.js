var path = require('path');
var findCacheDir = require('find-cache-dir');

module.exports = {
  // Don't try to find .babelrc because we want to force this configuration.
  babelrc: false,
  // This is a feature of `babel-loader` for webpack (not Babel itself).
  // It enables caching results in ./node_modules/.cache/react-scripts/
  // directory for faster rebuilds. We use findCacheDir() because of:
  // https://github.com/facebookincubator/create-react-app/issues/483
  cacheDirectory: findCacheDir({
    name: 'react-scripts'
  }),
  presets: [
    // Latest stable ECMAScript features
    require.resolve('babel-preset-latest'),
    // JSX, Flow
    require.resolve('babel-preset-react')
  ],
  plugins: [
    // Immutable destructuring
    require.resolve("babel-plugin-extensible-destructuring"),
    // class { handleClick = () => { } }
    require.resolve('babel-plugin-transform-class-properties'),
    // { ...todo, completed: true }
    require.resolve('babel-plugin-transform-object-rest-spread'),
    // function* () { yield 42; yield 43; }
    [require.resolve('babel-plugin-transform-regenerator'), {
      // Async functions are converted to generators by babel-preset-latest
      async: false
    }],
    // Polyfills the runtime needed for async/await and generators
    [require.resolve('babel-plugin-transform-runtime'), {
      helpers: false,
      polyfill: false,
      regenerator: true,
      // Resolve the Babel runtime relative to the config.
      // You can safely remove this after ejecting:
      moduleName: path.dirname(require.resolve('babel-runtime/package'))
    }]
  ]
};
