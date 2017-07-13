/**
 * Created by mario (https://github.com/hyprstack) on 03/02/2017.
 */
'use strict';

const config       = require('./../../config/configs');
const prefix       = config.get('TABLE_PREFIX');
const queryStrings = {};

// BRAND ID
queryStrings.getBrandId = () => {
  return "SELECT brand_id FROM `" + prefix + "-brandId-shopName` WHERE shop_name=?";
};

queryStrings.saveBrandId = () => {
  return "INSERT INTO `" + prefix + "-brandId-shopName` (shop_name, brand_id) VALUES (?, ?)";
};

// USER SESSION
queryStrings.getSessionObject = () => {
  return "SELECT session_object FROM `" + prefix + "-user-session` WHERE session_id=?";
};

queryStrings.saveSessionId = () => {
  return "INSERT INTO `" + prefix + "-user-session` (session_id) VALUES (?)";
};

queryStrings.updateSessionObject = () => {
  return "UPDATE `" + prefix + "-user-session` SET session_object=? WHERE session_id=?";
};

queryStrings.deleteExpiredSession = () => {
  //Deletes sessions where session.expires is one day behind the current date
  return "DELETE FROM `" + prefix + "-user-session` WHERE session_object.expires < ?";
};

queryStrings.getAccessToken = () => {
  return "SELECT access_token, access_token_expires_on, client_id, refresh_token, refresh_token_expires_on, user_id FROM `" + prefix + "-oauth-tokens` WHERE access_token=? AS solution";
};

queryStrings.getClient = () => {
  return "SELECT client_id, client_secret, redirect_uri FROM `" + prefix + "-oauth-clients` WHERE client_id=? AND client_secret=? AS solution";
};

queryStrings.saveClient = () => {
  return "INSERT INTO `" + prefix + "-oauth-clients` (client_id, client_secret, redirect_uri) VALUES (?, ?, ?)";
};

queryStrings.getUser = () => {
  return "SELECT id FROM `" + prefix + "-users` WHERE username=? AND password=?";
};

queryStrings.saveUser = () => {
  return "INSERT INTO `" + prefix + "-users` (username, password) VALUES (?, ?)";
};

queryStrings.saveAccessToken = () => {
  return "INSERT INTO `" + prefix + "-oauth_tokens` (access_token, access_token_expires_on, client_id, refresh_token, refresh_token_expires_on, user_id) VALUES (?,?,?,?,?,?)";
};

module.exports = queryStrings;