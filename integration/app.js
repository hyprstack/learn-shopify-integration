'use strict';

var express = require('express');
var app = express();
var configs = require('./lib/config/configs');
var router = require('./lib/routes/routes');
var cookieParser = require('cookie-parser');
var cors = require('cors');
app.disable('x-powered-by');

app.set('views', './views');
app.set('view engine', 'jade');
app.use(cookieParser(configs.get('COOKIE_PARSER_SECRET')));
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(router);

module.exports = app;
