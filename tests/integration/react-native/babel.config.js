module.exports = function (api) {
  api.cache(true);

  const presets = [
    '@babel/preset-env',
    '@babel/preset-flow'
  ];
  const plugins = [
    '@babel/plugin-proposal-class-properties',
    'transform-inline-environment-variables'
  ];

  return {
    presets,
    plugins
  };
}
