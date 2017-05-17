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
  createUserTable: "CREATE TABLE `" + prefix + "-users` (" +
  "`id` int(24) NOT NULL AUTO_INCREMENT, " +
  "`username` varchar(64), " +
  "`password` varchar(64), " +
  "PRIMARY KEY (`id`), " +
  "KEY `username` (`username`) " +
  ") ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8",
  createOauthClientsTable: "CREATE TABLE `" + prefix + "-oauth-clients` (" +
  "`client_id` varchar(64) DEFAULT '', " +
  "`client_secret` varchar(82), " +
  "`redirect_uri` varchar(264), " +
  "PRIMARY KEY (`client_id`), " +
  "KEY `client_secret` (`client_secret`) " +
  ") ENGINE=InnoDB DEFAULT CHARSET=utf8",
  createOauthTokensTable: "CREATE TABLE `" + prefix + "-oauth-token` (" +
  "`id` int(24) NOT NULL AUTO_INCREMENT, " +
  "`access_token` varchar(82), " +
  "`access_token_expires_on` datetime DEFAULT NULL, " +
  "`client_id` varchar(64), " +
  "`refresh_token` varchar(82), " +
  "`refresh_token_expires_on` datetime DEFAULT NULL, " +
  "`user_id` int(24), " +
  "PRIMARY KEY (`id`), " +
  "CONSTRAINT `user_id_token_fk` FOREIGN KEY (`user_id`) REFERENCES `" + prefix + "-users` (`id`) " +
  ") ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8"
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
      console.log('CREATING USER_SESSION TABLE');
      createTable(connectionApi, qStrings.createUserTable, next);
    },
    function (next) {
      console.log('CREATING OAUTH_CLIENTS TABLE');
      createTable(connectionApi, qStrings.createOauthClientsTable, next);
    },
    function (next) {
      console.log('CREATING OAUTH_TOKENS TABLE');
      createTable(connectionApi, qStrings.createOauthTokensTable, next);
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
