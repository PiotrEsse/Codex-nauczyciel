/* eslint-env node */

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
          alias: {
            '@components': './src/components',
            '@screens': './src/screens',
            '@navigation': './src/navigation',
            '@services': './src/services',
            '@state': './src/state',
            '@hooks': './src/hooks',
            '@utils': './src/utils'
          }
        }
      ]
    ]
  };
};
