"use strict";

var url         = require('url');
var utils       = require('lodash');
var kew         = require('kew');
var evaluate    = require('react-app-server-runtime');
var request     = require('react-app-controller/request');
var bundler     = require('react-app-bundler');
var createPage  = require('./create-page');

function compile(func) {
  return function() {
    return '(' + func.toString() + ')(' +
      utils.map(arguments, JSON.stringify).join(', ') + ');';
  }
}

var renderComponent = compile(function(data) {
  window.onload = function() {
    var controller = require('./app');
    controller.render(document.body, {data: data});
  }
});

var renderComponentToString = compile(function(request) {
  var controller = require('./app');
  controller.renderToString(request, function(err, rendered) {
    if (err) {
      return __callback(err);
    }
    rendered.isNotFoundErrorHandled = rendered.controller.state.page === null;
    __callback(null, rendered);
  });
});

function evaluatePromise() {
  var promise = kew.defer();
  var args = utils.toArray(arguments);
  args.push(promise.makeNodeResolver());
  /*jshint validthis:true */
  evaluate.apply(this, args);
  return promise;
}

function makeLocation(req, origin) {
  var protocol = !!req.connection.verifyPeer ? 'https://' : 'http://',
      reqOrigin = origin || (protocol + req.headers.host);
  return url.parse(reqOrigin + req.originalUrl);
}

function servePage(opts) {
  opts = opts || {};

  return function(req, res, next) {
    res.setHeader('Content-type', 'text/html');
    res.write(createPage({
      code: renderComponent(),
      meta: opts.meta,
      script: opts.script,
      link: opts.link
    }));
    res.end();
  }
}

function serveRenderedPage(bundle, opts) {
  opts = opts || {};

  if (typeof bundle !== 'function') {
    bundle = bundler.create(bundle, opts);
  }

  return function(req, res, next) {
    var location = makeLocation(req, opts.origin);
    var clientReq = request.createRequestFromLocation(location);
    bundle()
      .then(function(bundle) {
        return evaluatePromise({
          bundle: bundle,
          code: renderComponentToString(clientReq),
          debug: opts.debug
        });
      })
      .then(function(rendered) {
        res.setHeader('Content-type', 'text/html');
        res.statusCode = rendered.isNotFoundErrorHandled ? 404 : 200;
        res.write(createPage({
          body: rendered.markup,
          title: rendered.title,
          code: renderComponent(rendered.request.data),
          meta: opts.meta,
          script: opts.script,
          link: opts.link
        }));
        res.end();
      }, function(err) {
        err.isNotFoundError ? res.send(404) : next(err);
      });
  }
}

module.exports = servePage;
module.exports.servePage = servePage;
module.exports.serveRenderedPage = serveRenderedPage;
