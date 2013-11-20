# react-app-middleware

Connext/Express server middleware to serve pre-rendered React apps.

## Installation

    % npm install react-app-middleware

## Usage

Use [react-app-controller][] to define your application and then construct the
following middleware stack:

    var express = require('express');
    var ui = require('react-app-middleware');
    var bundle = require('react-app-bundler');

    var app = express();
    app.use(ui.serveRenderedPage('./index.jsx', {
      debug: true,
      script: '/bundle.js'
    }));
    app.get('/bundle.js', bundle.serve('./index.jsx', {debug: true}));

    app.listen(3000);

Note also that you need to ship client code to a browser, you can use
[react-app-bundler][] package for that.

[react-app-controller]: https://github.com/andreypopp/react-app-controller
[react-app-bundler]: https://github.com/andreypopp/react-app-bundler
