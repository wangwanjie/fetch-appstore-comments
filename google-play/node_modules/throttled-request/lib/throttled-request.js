/*
ThrottledRequest class
*/
'use strict';

var RequestMiddleware = require("./request-middleware")
,   EventEmitter = require("events").EventEmitter
,   util = require("util");

util.inherits(ThrottledRequest, EventEmitter);

function ThrottledRequest (request) {
  EventEmitter.call(this);

  var self = this;

  this.request = request;

  this.config = {
    requests: Infinity,
    milliseconds: Infinity
  };

  this.sentRequests = 0;
  this.startedAt = null;

  function _request () {
    return self.throttleRequest.apply(self, arguments);
  }

  _request.configure = function (config) {
    self.configure(config);
  }

  _request.set = function (key, value) {
    self[key] = value;
  }

  _request.get = function (key) {
    return self[key];
  }

  _request.on = function (event, handler) {
    self.on(event, function () {
      handler.apply(_request, arguments);
    });
  }

  return _request;
};

ThrottledRequest.prototype.configure = function (config) {
  if (!config) throw new Error("A config object must be provided");

  config.requests ? this.config.requests = config.requests : void 0;
  config.milliseconds ? this.config.milliseconds = config.milliseconds : void 0;
};

ThrottledRequest.prototype.throttleDelay = function() {
  if (isFunction(this.config.milliseconds)) {
    return this.config.milliseconds();
  }

  return this.config.milliseconds;
};

ThrottledRequest.prototype.throttleRequest = function () {
  var self = this
  ,   args = arguments
  ,   requestMiddleware
  ,   request;

  //Start counting time if hasn't started already
  if (!this.startedAt) this.startedAt = Date.now();
  if (!this.milliseconds) this.milliseconds = this.throttleDelay();
  
  if (Date.now() - this.startedAt >= this.milliseconds) {
    this.sentRequests = 0;
    this.startedAt = Date.now();
    this.milliseconds = this.throttleDelay();
  };

  if (this.sentRequests < this.config.requests) {
    this.sentRequests++;

    if (args[args.length - 1] instanceof RequestMiddleware) {
      requestMiddleware = args[args.length - 1];
      args[--args.length] = undefined;

      request = this.request.apply(null, args);
      requestMiddleware.use(request);
    } else {
      request = this.request.apply(null, args);
    };

    this.emit("request", args[0]);
    return request;
  };

  if (!(args[args.length - 1] instanceof RequestMiddleware)) {
    requestMiddleware = new RequestMiddleware();
    args[args.length++] = requestMiddleware;
  }

  setTimeout(function () {
    self.throttleRequest.apply(self, args);
  }, this.milliseconds - (Date.now() - this.startedAt));

  return requestMiddleware;
};


function isFunction(value) {
  return typeof value == 'function';
}

module.exports = ThrottledRequest;