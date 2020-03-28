// https://github.com/ant-design/ant-design/issues/12011#issuecomment-423173228
// https://github.com/ant-design/ant-design/issues/12011#issuecomment-423470708
const path = require('path');

/* config-overrides.js */
module.exports = function override(config, env) {
  let alias = config.resolve.alias || {};
  alias['@ant-design/icons/lib/dist$'] = path.resolve(
    __dirname,
    // './src/icons.js'
  );

  config.resolve.alias = alias;

  return config;
};
