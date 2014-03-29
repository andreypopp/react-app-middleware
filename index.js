"use strict";

var url         = require('url');
var utils       = require('lodash');
var kew         = require('kew');
var evaluate    = require('react-app-server-runtime');
var request     = require('react-app-controller/request');
var bundler     = require('react-app-bundler');
var fs          = require('fs');

function wrapLayout(layout, markup) {
  if (!layout) return markup;
  return layout.replace('{{yield}}', markup);
}

/**
 * Compile function to execute in other runtimes (vm module, browser).
 *
 * @param {Function} func function to compile, this cannot be a closure
 */
function compile(func) {
  return function() {
    return '(' + func.toString() + ')(' +
      utils.map(arguments, function(el) {
        return JSON.stringify(el) || 'null'
      }).join(', ') + ');';
  }
}

var renderComponent = compile(function(data, root) {
  window.onload = function() {
    var controller = require('./app');
    controller.render(document.querySelector(root) || document, {
      root: root,
      data: data
    });
  }
});

var renderComponentToString = compile(function(request) {
  var controller = require('./app');
  controller.renderToString(request, function(err, rendered) {
    if (err) {
      return __callback(err);
    }
    // page is null but we didn't get error - NotFoundError was handled by a
    // controller
    // TODO: move that check to controller interface
    rendered.isNotFoundErrorHandled = rendered.controller.state.page === null;
    __callback(null, rendered);
  });
});

/**
 * Like evaluate from react-app-server-runtime but exposes Promise API
 */
function evaluatePromise() {
  var promise = kew.defer();
  var args = utils.toArray(arguments);
  args.push(promise.makeNodeResolver());
  /*jshint validthis:true */
  evaluate.apply(this, args);
  return promise;
}

/**
 * Create window.location-like object from express request
 *
 * @param {ExpressRequest} req
 * @param {String} origin
 */
function makeLocation(req, origin) {
  var protocol = !!req.connection.verifyPeer ? 'https://' : 'http://',
      reqOrigin = origin || (protocol + req.headers.host);
  return url.parse(reqOrigin + req.originalUrl);
}

/**
 * Middleware for serving pre-rendered React UI
 *
 * @param {Bundler|Browserify|ModuleId} bundle
 * @param {Options} opts
 */
function servePage(bundle, opts) {
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
          debug: opts.debug,
          location: location
        });
      })
      .then(function(rendered) {
        var init = renderComponent(rendered.request.data, opts.root);
        var markup = wrapLayout(opts.layout, rendered.markup);
        markup = markup.replace('</body>', '<script>'+init+'</script></body>');
        res.setHeader('Content-type', 'text/html');
        res.statusCode = rendered.isNotFoundErrorHandled ? 404 : 200;
        res.write(markup);
        res.end();
      }, function(err) {
        err.isNotFoundError ? res.send(404) : next(err);
      });
  }
}

module.exports = servePage;
