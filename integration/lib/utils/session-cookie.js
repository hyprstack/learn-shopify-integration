/**
 * Created by mario (https://github.com/hyprstack) on 18/05/2016.
 */
'use strict';

const sessionCookie = {};

sessionCookie.gen = () => {
  let date = new Date();
  // Get Unix milliseconds at current time plus 1 day
  date.setTime(date.getTime() + (1 * 24 * 60 * 60 * 1000));
  const cookieVal = Math.random().toString(36).substring(7); // Generate a random cookie string
  return {
    cookieValue: cookieVal,
    expirationDate: date
  }
};

module.exports = sessionCookie;
