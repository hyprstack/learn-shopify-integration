/**
 * Created by mario (https://github.com/hyprstack) on 16/05/2017.
 */
'use strict';

const express     = require('express');
const router      = express.Router();
const configs     = require('./../config/configs');
const middleware  = require('./middleware/middleware');
const bodyParser  = require('body-parser');
const oauthServer = require('oauth2-server');
const util        = require('util');
const baseUrl     = configs.get('BASE_URL');
const app         = require('./../../app');
const model       = require('./../constructors/mySQL/mySql');

// Add OAuth server.
app.oauth = oauthServer({
  debug: true,
  grants: configs.get('GRANT_LIST'),
  model: model
});

router.use(bodyParser.json({
  verify: (req, res, buf, encoding) => {
    req.rawBody = buf;
  }
}));

router.use(bodyParser.urlencoded({extended: true}));

router.post('/oauth/token', (req, res) => {
  console.log('In /oauth/token');
  return app.oauth.grant();
});

router.get('/monitor-health', (req, res) => {
  res.sendStatus(200);
  res.end();
});

// Get authorization.
router.get('/oauth/authorize', (req, res) => {
  console.log('In GET /oauth/authorize');
  // Redirect anonymous users to login page.
  if (!req.app.locals.user) {
    return res.redirect(baseUrl + util.format('/login?redirect=%s&client_id=%s&redirect_uri=%s', req.path, req.query.client_id, req.query.redirect_uri));
  }

  return res.render('authorize', {
    client_id: req.query.client_id,
    redirect_uri: req.query.redirect_uri
  });
});

// Post authorization.
router.post('/oauth/authorize', (req, res) => {
  console.log('In POST /oauth/authorize');
  // Redirect anonymous users to login page.
  if (!req.app.locals.user) {
    return res.redirect(baseUrl + util.format('/login?client_id=%s&redirect_uri=%s', req.query.client_id, req.query.redirect_uri));
  }
  return app.oauth.authorise();
});

// Get login.
router.get('/login', middleware.displayLogin);

// Post login.
router.post('/login', middleware.startConnection, middleware.getUser, middleware.closeConnection);

// Get register page
router.get('/register', (req, res) => {
  console.log('In GET /register');
  return res.render('register');
});

// Post register
router.post('/register', middleware.startConnection, middleware.saveUser, middleware.closeConnection);

// Get secret.
router.get('/home', app.oauth.authorise(), (req, res) => {
  console.log('In GET /home');
  // Will require a valid access_token.
  res.send('Secret area');
});

module.exports = router;