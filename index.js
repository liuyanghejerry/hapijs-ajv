'use strict';

const packageInfo = require('./package.json');
const Ajv = require('ajv');
const ajv = new Ajv();
const cloneDeep = require('lodash/cloneDeep');

function validate(schema, data) {
  const valid = ajv.validate(schema, data);

  if (valid) {
    return null;
  }
  return cloneDeep(ajv.errors);
}

const ajvPlugin = {
  register: function (server, options, next) {
    server.decorate('request', 'validate', validate);
    next();
  }
};

ajvPlugin.register.attributes = {
  name: packageInfo.name,
  version: packageInfo.version
};

module.exports = ajvPlugin;
