# Webpack suffix resolver
#### Usage sample
```javascript
const SuffixResolver = require('webpack-suffix-resolver');
const webpackConfig = {
  ...
  resolve: {
    plugins: [new SuffixResolver('ios', ['.js', '.ts'])],
  },
  ...
};
```
The config above will resolve files with ``.ios.js``, ``.ios.ts`` first if there is no file matched then the original module will be resolved

