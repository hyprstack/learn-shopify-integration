'use strict';

const express      = require('express');
const app          = express();
const configs      = require('./lib/config/configs');
const router       = require('./lib/routes/routes');
const cookieParser = require('cookie-parser');
const cors         = require('cors');

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
