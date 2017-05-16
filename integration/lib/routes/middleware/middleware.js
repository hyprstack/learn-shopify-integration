/**
 * Created by mario (https://github.com/hyprstack) on 16/05/2017.
 */

'use strict';

const configs =           require('./../../config/configs');
const userSession =       require('./../../factories/database-selector').select(configs.get('SESSION_STORAGE'));
const sessionCookie =     require('./../../utils/session-cookie');
const statusCode =        require('./../../utils/status-code-checker');
const sessionCookieName = configs.get('HEVNLYWOO_SESSION_COOKIE');

const middleWare = {};

// Manage Connections - **START***STOP**

middleWare.startConnection = function (req, res, next) {
  userSession.initializeConnection(function(err) {
    if (err) {
      return next(err);
    }
    next();
  });
};

middleWare.closeConnection = function (req, res, next) {
  userSession.closeConnection(function(err) {
    if (err) {
      return next(err);
    }
    next();
  });
};

module.exports = middleWare;