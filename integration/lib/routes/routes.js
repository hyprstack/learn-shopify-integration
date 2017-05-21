/**
 * Created by mario (https://github.com/hyprstack) on 16/05/2017.
 */
'use strict';

const express =      require('express');
const router =       express.Router();
const configs =      require('./../config/configs');
const middleware =   require('./middleware/middleware');
const bodyParser =   require('body-parser');
const oauthServer =  require('oauth2-server');
const util =         require('util');
const baseUrl =      configs.get('BASE_URL');

const useBodyParserJson = bodyParser.json({
  verify: function (req, res, buf, encoding) {
    req.rawBody = buf;
  }
});

const useBodyParserUrlEncoded = bodyParser.urlencoded({extended: true});

// Add OAuth server.
app.oauth = oauthServer({
  debug: true,
  grants: configs.get('GRANT_LIST'),
  model: require('./../constructors/mySQL/mySql')
});

router.post('/oauth/token', app.oauth.token());

router.get('/monitor-health', function(req, res) {
  res.sendStatus(200);
  res.end();
});

//TODO: add base url to all redirect urls (api-gateway needs this)
// Get authorization.
router.get('/oauth/authorize', function(req, res) {
  // Redirect anonymous users to login page.
  if (!req.app.locals.user) {
    return res.redirect(baseUrl + util.format('/login?redirect=%s&client_id=%s&redirect_uri=%s', req.path, req.query.client_id, req.query.redirect_uri));
  }

  return render('authorize', {
    client_id: req.query.client_id,
    redirect_uri: req.query.redirect_uri
  });
});

// Post authorization.
router.post('/oauth/authorize', function(req, res) {
  // Redirect anonymous users to login page.
  if (!req.app.locals.user) {
    return res.redirect(baseUrl + util.format('/login?client_id=%s&redirect_uri=%s', req.query.client_id, req.query.redirect_uri));
  }

  return app.oauth.authorize();
});

// Get login.
router.get('/login', function(req) {
  return render('login-form', {
    redirect: req.query.redirect,
    client_id: req.query.client_id,
    redirect_uri: req.query.redirect_uri
  });
});

// Post login.
router.post('/login', function(req, res) {
  // @TODO: Insert your own login mechanism.
  if (req.body.email !== 'thom@nightworld.com') {
    return render('login', {
      redirect: req.body.redirect,
      client_id: req.body.client_id,
      redirect_uri: req.body.redirect_uri
    });
  }

  // Successful logins should send the user back to /oauth/authorize.
  var path = req.body.redirect || '/home';

  return res.redirect(baseUrl + util.format('/%s?client_id=%s&redirect_uri=%s', path, req.query.client_id, req.query.redirect_uri));
});

// Get secret.
router.get('/', app.oauth.authorize(), function(req, res) {
  // Will require a valid access_token.
  res.send('Secret area');
});

module.exports = router;