var assert      = require('assert');
var path        = require('path');
var express     = require('express');
var req         = require('supertest');
var ui          = require('../index');

function fixture(name) {
  return path.join(__dirname, 'fixtures', name);
}

describe('serveRenderedPage', function() {

  var app = express();
  app.use(ui.serveRenderedPage(fixture('basic-app.jsx')));

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
