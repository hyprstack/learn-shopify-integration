/**
 * Created by mario (https://github.com/hyprstack) on 03/02/2017.
 */
'use strict';

const config = require('./../../config/configs');
const prefix = config.get('TABLE_PREFIX');
const queryStrings = {};

// BRAND ID
queryStrings.getBrandId = function () {
  return "SELECT brand_id FROM `" + prefix + "-brandId-shopName` WHERE shop_name=?";
};

queryStrings.saveBrandId = function () {
  return "INSERT INTO `" + prefix + "-brandId-shopName` (shop_name, brand_id) VALUES (?, ?)";
};

// USER SESSION
queryStrings.getSessionObject = function () {
  return "SELECT session_object FROM `" + prefix + "-user-session` WHERE session_id=?";
};

queryStrings.saveSessionId = function () {
  return "INSERT INTO `" + prefix + "-user-session` (session_id) VALUES (?)";
};

queryStrings.updateSessionObject = function () {
  return "UPDATE `" + prefix + "-user-session` SET session_object=? WHERE session_id=?";
};

queryStrings.deleteExpiredSession = function () {
  //Deletes sessions where session.expires is one day behind the current date
  return "DELETE FROM `" + prefix + "-user-session` WHERE session_object.expires < ?";
};

module.exports = queryStrings;