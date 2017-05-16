/**
 * Created by mario (https://github.com/hyprstack) on 18/05/2016.
 */
'use strict';

var sessionCookie = {};

sessionCookie.gen = function () {
  var date = new Date();

  // Get Unix milliseconds at current time plus 1 day
  date.setTime(date.getTime() + (1 * 24 * 60 * 60 * 1000));
  var cookieVal = Math.random().toString(36).substring(7); // Generate a random cookie string

  return {
    cookieValue: cookieVal,
    expirationDate: date
  }
};

module.exports = sessionCookie;
