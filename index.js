'use strict';

const Boom = require('boom');
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

function defaultProcessError(mismachedInfos) {
  const err = Boom.badRequest(null);
  err.output.ajvError = mismachedInfos;
  return err;
}

const ajvPlugin = {
  register: function (server, options, next) {
    server.ext({
      type: 'onPreHandler',
      method: function (request, reply) {
        const config = request.route.settings.plugins['hapijs-ajv'];
        const processError = options.processError || defaultProcessError;
        if (!config) {
          return reply.continue();
        }
        let mismachedInfos = null;
        const payloadSchema = config.payloadSchema;
        const querySchema = config.querySchema;
        if (!payloadSchema) {
          return reply.continue();
        }
        mismachedInfos = validate(payloadSchema, request.payload);
        if (mismachedInfos) {
          const err = processError(mismachedInfos);
          reply(err);
          return;
        }

        if (!querySchema) {
          return reply.continue();
        }
        mismachedInfos = validate(querySchema, request.query);
        if (mismachedInfos) {
          const err = processError(mismachedInfos);
          reply(err);
          return;
        }
      }
    });
    next();
  }
};

ajvPlugin.register.attributes = {
  pkg: require('./package.json')
};

module.exports = ajvPlugin;
