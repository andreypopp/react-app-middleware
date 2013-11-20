"use strict";

var url         = require('url');
var utils       = require('lodash');
var kew         = require('kew');
var evaluate    = require('react-app-server-runtime');
var controller  = require('react-app-controller');
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
    controller.start(data);
  }
});

var renderComponentToString = compile(function(request) {
  var controller = require('./app');
  controller.generateMarkup(request, __callback);
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

  if (utils.isString(bundle))
    bundle = bundler.create(bundle, opts);

  return function(req, res, next) {
    var location = makeLocation(req, opts.origin);
    var request = controller.createRequestFromLocation(location);
    bundle()
      .then(function(bundle) {
        return evaluatePromise({
          bundle: bundle,
          code: renderComponentToString(request),
          debug: opts.debug
        });
      })
      .then(function(rendered) {
        res.setHeader('Content-type', 'text/html');
        res.write(createPage({
          body: rendered.markup,
          title: rendered.title,
          code: renderComponent(rendered.data),
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
