/**
 * Created by mario (https://github.com/hyprstack) on 02/05/2017.
 */
'use strict';

const config    = require('./../../config/configs');
const mysql     = require('mysql');
const dbConfigs = config.get('STORAGE_CONFIG');
const queries   = require('./queries');
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

let connection = false;

mySqlManager.initializeConnection = (req, res, callback) => {
  if (!dbConfig.host || !dbConfig.user || !dbConfig.password) {
    return false;
  }
  console.log('Mysql: connecting to ' + dbConfig.host + ':' + dbConfig.database);
  connection = mysql.createConnection(dbConfig);
  connection.connect((err) => {
    if (err) {
      winston.info('Error connecting to Mysql: ' + err);
      return callback(err);
    }
    console.log('Mysql connection established');
    callback();
  });
};

mySqlManager.closeConnection = (req, res, callback) => {
  connection.end((err) => {
    if (err) {
      console.log('Error closing Mysql connection');
      return callback(err, null);
    }
    console.log('Closing Mysql connection');
    callback(null, null);
  });
};

// AUTHENTICATION

// The access token retrieved form storage or falsey to indicate invalid access token
mySqlManager.getAccessToken = (bearerToken, callback) => {
  const qS = queries.getAccesToken();
  connection.query(qS, [bearerToken], (err, results, fields) => {
    if (err) {
      return callback(err, null);
    }
    const tokenObj = results[0].solution;
    if (!tokenObj) {
      return callback(null, false);
    }
    const expObj = {
      accessToken: tokenObj.access_token,
      clientId: tokenObj.client_id,
      expires: tokenObj.expires,
      userId: tokenObj.userId
    };
    callback(null, expObj);
  });
};

mySqlManager.getClient = (clientId, clientSecret, callback) => {
  const qS = queries.getClient();
  connection.query(qS, [clientId, clientSecret], (err, results, fields) => {
    if (err) {
      return callback(err, null);
    }
    const clientObj = results[0].solution;
    if (!clientObj) {
      return (callback(null, false));
    }
    const expObj = {
      clientId: clientObj.client_id,
      clientSecret: clientObj.client_secret,
      redirectUri: clientObj.redirect_uri
    };
    callback(null, expObj);
  });
};

mySqlManager.saveClient = (clientId, clientSecret, redirectUrl, callback) => {
  const qS = queries.saveClient();
  connection.query(qS, [clientId, clientSecret, redirectUrl] , (err, results, fields) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, results[0]);
  });
};

mySqlManager.getUser = (username, password, callback) => {
  const qS = queries.getUser();
  connection.query(qS, [username, password], (err, results, fields) => {
    if (err) {
      return callback(err, null);
    }
    const userObj = results[0].solution;
    if (!userObj) {
      return (callback(null, false));
    }
    const expObj = {
      id: userObj.id
    };
    callback(null, expObj);
  });
};

mySqlManager.saveUser = (username, password, callback) => {
  const qS = queries.saveUser();
  connection.query(qS, [username, password], (err, results, fields) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, results[0]);
  });
};

mySqlManager.saveAccessToken = (token, client, user, callback) => {
  const qS = queries.saveAccessToken();
  connection.query(qS, [token.accessToken, token.accessTokenExpiresOn, client.id, token.refreshToken, token.refreshTokenExpiresOn, user.id], (err, results, fields) => {
    if (err) {
      return callback(err, null);
    }
    if (!results.length) {
      return callback(null, false);
    }
    callback(null, results[0]);
  });
};

// BRAND ID

// mySqlManager.getBrandId = (shopName, callback) => {
//   const qS = queries.getBrandId();
//   connection.query(qS, [shopName], (err, results, fields) => {
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
// mySqlManager.saveBrandId = (shopName, brandId, callback) => {
//   const qStr = queries.saveBrandId();
//   connection.query(qStr, [shopName, brandId], (err, results, fields) => {
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
// mySqlManager.getSessionObject = (sessionId, callback) => {
//   const qStr = queries.getSessionObject();
//   connection.query(qStr, [sessionId], (err, results, fields) => {
//     if (err) {
//       return callback(err);
//     }
//     callback(null, {session_object: results[0].session_object});
//   });
// };
//
// mySqlManager.saveSessionId = (sessionId, callback) => {
//   const qStr = queries.saveSessionId();
//   connection.query(qStr, [sessionId], (err, results, fields) => {
//     if (err) {
//       return callback(err, null);
//     }
//     callback(null, results);
//   });
// };
//
// mySqlManager.updateSessionObject = (sessionId, sessionObj, callback) => {
//   const qStr = queries.getSessionObject();
//   connection.query(qStr, [sessionId], (err, results, fields) => {
//     if (err) {
//       return callback(err);
//     }
//     let qS = queries.saveSessionId();
//     let params = [sessionId];
//     if (results.length) {
//       qS = queries.updateSessionObject();
//       params = [sessionObj, sessionId];
//       return connection.query(qS, params, (err, results, fields) => {
//         if (err) {
//           return callback(err);
//         }
//         callback(null, null);
//       });
//     }
//     //saves new session id
//     console.log('Saving new sessionId');
//     connection.query(qS, params, (err, results, fields) => {
//       if (err) {
//         return callback(err);
//       }
//       qS = queries.updateSessionObject();
//       params = [sessionObj, sessionId];
//       return connection.query(qS, params, (err, results, fields) => {
//         if (err) {
//           return callback(err);
//         }
//         callback(null, null);
//       });
//     });
//   });
// };
//
// mySqlManager.deleteExpiredSession = (params, callback) => {
//   const qStr = queries.deleteExpiredSession();
//   connection.query(qStr, params, callback);
// };

module.exports = mySqlManager;