'use strict';

/**
 * New Relic agent configuration.
 *
 * See lib/config/default.js in the agent distribution for a more complete
 * description of configuration variables and their potential values.
 */
exports.config = {
  app_name: [process.env.NEW_RELIC_APP_NAME || 'vyma-backend'],
  license_key: process.env.NEW_RELIC_LICENSE_KEY || '',
  agent_enabled: process.env.NEW_RELIC_ENABLED === 'true',
  logging: {
    level: 'info',
    filepath: 'stdout',
  },
  allow_all_headers: true,
  attributes: {
    exclude: [
      'request.headers.cookie',
      'request.headers.authorization',
      'request.headers.proxyAuthorization',
      'request.headers.setCookie',
      'request.headers.xApiKey',
      'response.headers.cookie',
      'response.headers.authorization',
      'response.headers.proxyAuthorization',
      'response.headers.setCookie',
    ],
  },
};
