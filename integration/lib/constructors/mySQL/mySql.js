/**
 * Created by mario (https://github.com/hyprstack) on 02/05/2017.
 */
'use strict';

const config = require('./../../config/configs');
const mysql = require('mysql');
const dbConfigs = config.get('STORAGE_CONFIG');
const queries = require('./queries');
// const sessionCookie = require('./../../utils/session-cookie');
// const statusCode = require('./../../utils/status-code-checker');
// const sessionCookieName = configs.get('HEVNLYWOO_SESSION_COOKIE');
const dbConfig = {
  host     : dbConfigs.host,
  user     : dbConfigs.user,
  password : dbConfigs.password,
  database : dbConfigs.name,
  charset  : dbConfigs.charset
};
const mySqlManager = {};

var connection = false;

mySqlManager.initializeConnection = function(req, res, callback) {
  if (!dbConfig.host || !dbConfig.user || !dbConfig.password) {
    return false;
  }
  console.log('Mysql: connecting to ' + dbConfig.host + ':' + dbConfig.database);
  connection = mysql.createConnection(dbConfig);
  connection.connect(function(err) {
    if (err) {
      winston.info('Error connecting to Mysql: ' + err);
      return callback(err);
    }
    console.log('Mysql connection established');
    callback();
  });
};

mySqlManager.closeConnection = function(req, res, callback) {
  connection.end(function(err) {
    if (err) {
      console.log('Error closing Mysql connection');
      return callback(err, null);
    }
    console.log('Closing Mysql connection');
    callback(null, null);
  });
};

// BRAND ID

// mySqlManager.getBrandId = function(shopName, callback) {
//   var qS = queries.getBrandId();
//   connection.query(qS, [shopName], function(err, results, fields) {
//     if (err) {
//       return callback(err);
//     }
//     if (!results.length) {
//       return callback(null, null);
//     }
//     callback(null, {'brand_id': results[0].brand_id});
//   });
// };
//
// mySqlManager.saveBrandId = function(shopName, brandId, callback) {
//   var qStr = queries.saveBrandId();
//   connection.query(qStr, [shopName, brandId], function(err, results, fields) {
//     if (err) {
//       return callback(err, null);
//     }
//     callback(null);
//   });
// };
//
//
// // USER SESSION
//
// mySqlManager.getSessionObject = function(sessionId, callback) {
//   var qStr = queries.getSessionObject();
//   connection.query(qStr, [sessionId], function(err, results, fields) {
//     if (err) {
//       return callback(err);
//     }
//     callback(null, {session_object: results[0].session_object});
//   });
// };
//
// mySqlManager.saveSessionId = function(sessionId, callback) {
//   var qStr = queries.saveSessionId();
//   connection.query(qStr, [sessionId], function(err, results, fields) {
//     if (err) {
//       return callback(err, null);
//     }
//     callback(null, results);
//   });
// };
//
// mySqlManager.updateSessionObject = function(sessionId, sessionObj, callback) {
//   var qStr = queries.getSessionObject();
//   connection.query(qStr, [sessionId], function(err, results, fields) {
//     if (err) {
//       return callback(err);
//     }
//     var qS = queries.saveSessionId();
//     var params = [sessionId];
//     if (results.length) {
//       qS = queries.updateSessionObject();
//       params = [sessionObj, sessionId];
//       return connection.query(qS, params, function(err, results, fields) {
//         if (err) {
//           return callback(err);
//         }
//         callback(null, null);
//       });
//     }
//     //saves new session id
//     console.log('Saving new sessionId');
//     connection.query(qS, params, function(err, results, fields) {
//       if (err) {
//         return callback(err);
//       }
//       qS = queries.updateSessionObject();
//       params = [sessionObj, sessionId];
//       return connection.query(qS, params, function(err, results, fields) {
//         if (err) {
//           return callback(err);
//         }
//         callback(null, null);
//       });
//     });
//   });
// };
//
// mySqlManager.deleteExpiredSession = function(params, callback) {
//   var qStr = queries.deleteExpiredSession();
//   connection.query(qStr, params, callback);
// };

module.exports = mySqlManager;