/**
 * Created by mario (https://github.com/hyprstack) on 17/03/2016.
 */
'use strict';

const statusCodeChecker = {};

statusCodeChecker.checkRange = (statusCode) => {
  let truthyCase = statusCode >= 200 && statusCode <= 299;
  return truthyCase;
};

module.exports = statusCodeChecker;