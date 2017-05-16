/**
 * Created by mario (https://github.com/hyprstack) on 26/10/2016.
 */
'use strict';

var mysql = require('./../constructors/mySQL/mySql');

var db = {};

db.select = function (config) {
  var service;
  switch(config) {
    case 'mySQL':
      service = mysql;
      break;
    default:
      service = mysql;
  }

  return service;
};

module.exports = db;