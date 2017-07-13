/**
 * Created by mario (https://github.com/hyprstack) on 02/12/2015.
 */
'use strict';

const app = require('./app');

const server = app.listen(3000, () => {
  const port = server.address().port;
  console.log('App listening on port %s', port);
});

module.exports = server;
