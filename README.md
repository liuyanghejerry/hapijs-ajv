# hapijs-ajv

A very simple combination of hapi and ajv.

# Usage

This plugin helps you check two inputs: query string and simple payload.

1. Register the plugin into hapi:
  ```javascript
  server.register({
    register: require('hapijs-ajv'),
    options: {
      // Optional parameter that can intercept Ajv mismached info.
      processError: (ajvError) => {
        const err = Boom.badRequest("Corrupt data");
        err.output.errorDetails = ajvError;
        return err;
      }
    }
  }, (err) => {
    if (err) {
      console.error('Failed to load plugin:', err);
      throw err;
    }
  });
  ```

2. For each route, if you want the plugin to do a JSON schema check, then you need to add `hapijs-ajv` config to `plugins`. The config has two optional keys, `payloadSchema` and `querySchema`, which are schemas for each input.  Values for those two keys are Ajv JSON schema object.

  If any of the schema cannot pass, error 400 is thrown. By default, key `ajvError` in the response will contains the mismach information, provided by Ajv. If you want to have your own way to handle the info, remember to pass `processError` in plugin options.

  Example:

  ```javascript
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
          },
          querySchema: {
            "type": "object",
            "required": ["company"],
            "properties": {
              "company": {
                "type": "string",
                "pattern": "[a-z]+"
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
  ```
