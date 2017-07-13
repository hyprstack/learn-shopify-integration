/**
 * Created by mario (https://github.com/hyprstack) on 26/10/2016.
 */
'use strict';

const mysql = require('./../constructors/mySQL/mySql');

const db = {};

db.select =  (config) => {
  let service;
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