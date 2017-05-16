/**
 * Created by mario (https://github.com/hyprstack) on 14/05/2017.
 */
'use strict';

var nconf = require('nconf');
// This is the order of preference

// 2. `process.env`
// 3. `process.argv`
nconf.env().argv();

// Values in `config.json`
nconf.file('./config.json');

//Any default values
nconf.defaults({
  'AWS_REGION': 'eu-west-1',
  'BASE_URL': 'http://localhost:3000',
  'COOKIE_PARSER_SECRET': 'mysuperawesometestlongsecret44',
  'SESSION_COOKIE': 'dev_session',
  'OAUTH2_SERVER_CLIENT_ID': '',
  'OAUTH2_SERVER_CLIENT_SECRET': '',
  'SHOPIFY_CLIENT_ID': '',
  'SHOPIFY_CLIENT_SECRET': '',
  'SHOPIFY_REDIRECT_URL': '/handle-o-auth-response',
  'SHOPIFY_WEBHOOK_UNINSTALL_URL': '/shopify-app-uninstall',
  'TABLE_PREFIX': 'dev',
  'STORAGE_SERVICE': 'mysql',
  'QUEUE_SERVICE': 'aws-sqs',
  'NOTIFICATION_SERVICE': 'aws-sns',
  "STORAGE_CONFIG": {}
});

// STORAGE_CONFIG should contain
/*
 "host"     : "localhost",
 "user"     : "yourusername",
 "password" : "yourpassword",
 "name" : "thenameofyourdatabase",
 "charset"  : "utf8"
 */

module.exports = nconf;