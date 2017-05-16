/**
 * Created by mario (https://github.com/hyprstack) on 16/05/2017.
 */

'use strict';

const configs =           require('./../../config/configs');
const userSession =       require('./../../factories/database-selector').select(configs.get('SESSION_STORAGE'));

// Manage Connections - **START***STOP**

module.exports = {
  initializeConnection: userSession.initializeConnection, // start connection with database
  closeConnection:      userSession.closeConnection      // close connection with database
};
