/**
 * Created by mario (https://github.com/hyprstack) on 23/05/2017.
 */
'use strict';

const crypto = require('crypto');
const secret = 'testsecret484nvuidfh8rkjsdf83';
const clientIdString = 'learn shopify';
const clientSecretString = 'This is my new secret string for learn shopify';

const generateClientId = () => {
  let hash = crypto.createHmac('sha256', secret)
    .update(clientIdString)
    .digest('hex');
  return hash;
};

const generateClientSecret = () => {
  let hash = crypto.createHmac('sha256', secret)
    .update(clientSecretString)
    .digest('base64');
  return hash;
};

const generate = () => {
  let clientId = generateClientId();
  let clientSecret = generateClientSecret();
  console.log(clientId + ' ------ ' + clientSecret);
  return {'clientId': clientId, 'clientSecret': clientSecret};
};

module.exports = generate();