'use strict';

const assert = require('assert');
const Hapi = require('hapi');
const Boom = require('boom');
const server = new Hapi.Server();
server.connection({
  labels: ['api'],
  port: 0
});

const api = server.select('api');
api.route({
  method: 'GET',
  path: '/',
  handler: (request, reply) => {
    reply('pass');
  }
});

api.route({
  method: 'POST',
  path: '/',
  config: {
    plugins: {
      'hapijs-ajv': {
        payloadSchema: {
          "type": "object",
          "required": ["name", "age"],
          "properties": {
            "name": {
              "type": "string",
              "pattern": "[a-z]+"
            },
            "age": {
              "type": "number",
              "maximum": 100,
              "minimum": 1
            }
          }
        }
      }
    },
    handler: function (request, reply) {
      reply('api index');
    }
  }
});

api.register({
  register: require('./index'),
  options: {
    processError: (ajvError) => {
      const err = Boom.badRequest("Corrupt data");
      err.output.errorDetails = ajvError;
      return err;
    }
  }
}, (err) => {
  if (err) {
    console.error('Failed to load plugin:', err);
  }
});

api.inject({
  url: '/',
  method: 'POST',
  payload: {
    name: 'abc',
    age: 2
  }
}, (res) => {
  assert.equal(res.result, 'api index', 'Happy path should pass.');
});

api.inject({
  url: '/',
  method: 'GET',
}, (res) => {
  assert.equal(res.result, 'pass', 'Non-related route should not be affected.');
});

api.inject({
  url: '/',
  method: 'POST',
  payload: {
    name: 'abc',
    age: 22222
  }
}, (res) => {
  assert.equal(res.result.statusCode, 400, 'Plugin should at least throw status 400');
});

console.log('Tests pass.');
