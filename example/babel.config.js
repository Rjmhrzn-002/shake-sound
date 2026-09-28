const path = require('path');

// Resolve babel-preset-expo from expo's own tree. In this standalone-module repo
// the preset isn't hoisted to example/node_modules (it's nested under expo/), so
// a bare 'babel-preset-expo' string fails to resolve. Pinning it to expo's copy
// also guarantees the SDK-matched version (and its matching @react-native/codegen),
// which avoids the cross-version codegen errors.
const babelPresetExpo = require.resolve('babel-preset-expo', {
  paths: [path.dirname(require.resolve('expo/package.json'))],
});

module.exports = function (api) {
  api.cache(true);
  return {
    presets: [babelPresetExpo],
  };
};
