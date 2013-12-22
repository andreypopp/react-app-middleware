var assert      = require('assert');
var path        = require('path');
var express     = require('express');
var req         = require('supertest');
var ui          = require('../index');

function fixture(name) {
  return path.join(__dirname, 'fixtures', name);
}

function getApp(name) {
  return express().use(ui.serveRenderedPage(fixture(name)));
}

describe('serveRenderedPage', function() {

  describe('rendering', function() {

    var app = getApp('basic-app.jsx');

    it('works (getting /)', function(done) {
      req(app)
        .get('/')
        .expect(200)
        .expect('Content-type', 'text/html')
        .end(function(err, res) {
          if (err) return done(err);
          assert.ok(/Main page/.exec(res.text));
          done();
        });
    });

    it('works (getting /about)', function(done) {
      req(app)
        .get('/about')
        .expect(200)
        .expect('Content-type', 'text/html')
        .end(function(err, res) {
          if (err) return done(err);
          assert.ok(/About page/.exec(res.text));
          done();
        });
    });
  });

  describe('handling NotFoundError', function() {

    it('returns error if NotFoundError is not handled', function(done) {
      var app = getApp('not-found-thrown.jsx');
      req(app)
        .get('/')
        .expect(404)
        .expect('Content-type', 'text/plain')
        .end(done);
    });

    it('returns error with custom markup if NotFoundError is handled', function(done) {
      var app = getApp('not-found-handled.jsx');
      req(app)
        .get('/')
        .expect(404)
        .expect('Content-type', 'text/html')
        .end(function(err, res) {
          if (err) return done(err);
          assert.ok(/NotFound/.exec(res.text));
          done();
        });
    });

  });
});

describe('servePage', function() {

  var app = express();
  app.use(ui.servePage());

  it('works (getting /)', function(done) {
    req(app)
      .get('/')
      .expect(200)
      .expect('Content-type', 'text/html')
      .end(function(err, res) {
        if (err) return done(err);
        assert.ok(/<html>/.exec(res.text));
        done();
      });
  });

  it('works (getting /about)', function(done) {
    req(app)
      .get('/about')
      .expect(200)
      .expect('Content-type', 'text/html')
      .end(function(err, res) {
        if (err) return done(err);
        assert.ok(/<html>/.exec(res.text));
        done();
      });
  });
});
