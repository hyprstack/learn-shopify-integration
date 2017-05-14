/**
 * Created by mario (https://github.com/hyprstack) on 14/05/2017.
 */
'use strict';
const mysql = require('mysql');
const async = require('async');
const config = require('./lib/config/configs');
const prefix = config.get('TABLE_PREFIX');
const dbConfigs = config.get('STORAGE_CONFIG');
var confApi = {
  host     : dbConfigs.host,
  user     : dbConfigs.user,
  password : dbConfigs.password,
  database : dbConfigs.name,
  charset  : dbConfigs.charset
};
var connectionApi;

const qStrings = {
  createUserSessionTable: "CREATE TABLE `" + prefix + "-user-session` (" +
  "`session_id` varchar(40) DEFAULT '', " +
  "`session_object` varchar(264), " +
  "PRIMARY KEY (`session_id`) " +
  ") ENGINE=InnoDB DEFAULT CHARSET=utf8"
};

function initApi(callback) {
  connectionApi = mysql.createConnection(confApi);
  connectionApi.connect(function(err) {
    if (err) {
      console.log('Error connecting to api: ' + err);
      return callback(err);
    }
    console.log('Api connection established');
    callback();
  });
}

function closeApiConnection(callback) {
  connectionApi.end(function(err) {
    if (err) {
      console.log('Error closing api connection');
      return callback(err, null);
    }
    console.log('Closing api connection');
    callback();
  });
}

function createTable(connection, qString, callback) {
  connection.query(qString, function(err, results) {
    if (err) {
      console.log(err);
      console.log(results);
      return callback(err);
    }
    callback(null);
  });
}

function buildTables() {
  async.series([
    function(next) {
      initApi(next);
    },
    function (next) {
      console.log('CREATED USER_SESSION TABLE');
      createTable(connectionApi, qStrings.createUserSessionTable, next);
    },
    function(next) {
      closeApiConnection(next);
    }
  ], function(err) {
    if (err) {
      console.log(err);
      return process.exit(1);
    }
    process.exit(0);
  });
}

module.export = {
  buildTables: buildTables()
};
