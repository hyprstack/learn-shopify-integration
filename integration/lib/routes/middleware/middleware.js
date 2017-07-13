/**
 * Created by mario (https://github.com/hyprstack) on 16/05/2017.
 */
'use strict';

const configs     = require('./../../config/configs');
const userSession = require('./../../factories/database-selector').select(configs.get('SESSION_STORAGE'));
const middleWare = {};

/* ************* MIDDLEWARE - COMMON *********** */

middleWare.startConnection = (req, res, next) => {
  return userSession.initializeConnection((err) => {
    if (err) {
      return next(err);
    }
    next();
  });
};

middleWare.closeConnection = (req, res, next) => {
  return userSession.closeConnection((err) => {
    if (err) {
      return next(err);
    }
    next();
  });
};

middleWare.displayLogin = (req, res, next) => {
  res.render('login-form', {
    redirect: req.query.redirect,
    client_id: req.query.client_id,
    redirect_uri: req.query.redirect_uri
  });
  return next();
};

middleWare.saveUser = (req, res, next) => {
  if (req.body.password !== req.body.confirm_password) {
    return res.render('register', {errorMessage: 'Passwords do not match. Please ensure your passwords are the same!'});
  }
  userSession.saveUser(req.body.username, req.body.password, (err) => {
    if (err) {
      console.log(err);
      return next(err);
    }
    console.log(`New user ${req.body.username} saved`);
    res.redirect('/home');
    return next();
  });
};

middleWare.getUser = (req, res, next) => {
  if (!req.body.username || !req.body.password) {
    return res.render('login-form', {
      redirect: req.body.redirect,
      client_id: req.body.client_id,
      redirect_uri: req.body.redirect_uri
    });
  }
  userSession.getUser(req.body.username, req.body.password, (err, userObj) => {
    if (err) {
      console.log(err);
      return next(err);
    }
    if (!userObj) {
      return res.render('login-form', {
        redirect: req.body.redirect,
        client_id: req.body.client_id,
        redirect_uri: req.body.redirect_uri,
        errorMessage: `Wrong username ${req.body.username} or password submitted`
      });
    }
    // Successful logins should send the user back to /oauth/authorize.
    let path = req.body.redirect || '/home';
    res.redirect(baseUrl + util.format('/%s?client_id=%s&redirect_uri=%s', path, req.query.client_id, req.query.redirect_uri));
    return next();
  });
};

module.exports = middleWare;

