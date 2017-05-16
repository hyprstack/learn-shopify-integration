/**
 * Created by mario (https://github.com/hyprstack) on 17/03/2016.
 */
'use strict';

var statusCodeChecker = {};

statusCodeChecker.checkRange = function (statusCode) {
  var truthyCase = statusCode >= 200 && statusCode <= 299;
  return truthyCase;
};

module.exports = statusCodeChecker;