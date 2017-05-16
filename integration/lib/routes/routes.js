/**
 * Created by mario (https://github.com/hyprstack) on 16/05/2017.
 */
'use strict';

const express =      require('express');
const router =       express.Router();
const configs =      require('./../config/configs');
const middleware =   require('./middleware/middleware');
const bodyParser =   require('body-parser');

const useBodyParserJson = bodyParser.json({
  verify: function (req, res, buf, encoding) {
    req.rawBody = buf;
  }
});

const useBodyParserUrlEncoded = bodyParser.urlencoded({extended: true});

router.get('/monitor-health', function(req, res) {
  res.sendStatus(200);
  res.end();
});

module.exports = router;