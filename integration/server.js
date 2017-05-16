/**
 * Created by mario (https://github.com/hyprstack) on 02/12/2015.
 */
'use strict';

var app = require('./app');

var server = app.listen(3000, function () {
  var port = server.address().port;
  console.log('App listening on port %s', port);
});

module.exports = server;
