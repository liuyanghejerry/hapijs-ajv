'use strict';

const Hapi = require('hapi');
const server = new Hapi.Server();
server.connection({
  labels: ['api'],
  port: 3000
});

const api = server.select('api');
api.route({
  method: 'GET',
  path: '/',
  handler: function (request, reply) {
    const schema = {
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
    };
    const data = {
      name: 'abc',
      age: 123
    };
    console.log(request.validate(schema, data));
    reply('api index');
  }
});

api.register({
  register: require('./index'),
  options: {}
}, (err) => {
  if (err) {
    console.error('Failed to load plugin:', err);
  }
});

server.start();
