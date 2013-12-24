"use strict";

/**
 * Create HTML element attributes from a =n object
 *
 * @param {Object} attrs
 */
function createAttrs(attrs) {
  var buf = [];
  for (var k in attrs) {
    buf.push(k + '="' + attrs[k] + '"');
  }
  return buf.join(' ');
}

/**
 * Create HTML document from specification
 *
 * @param {Object} spec
 */
function createPage(spec) {
  var buf = ['<!doctype html>', '<html>', '<head>'];

  if (spec.title) {
    buf.push('<title>' + spec.title + '</title>');
  }

  if (spec.meta) {
    [].concat(spec.meta).forEach(function(meta) {
      buf.push('<meta ' + createAttrs(meta) + '>');
    });
  }

  if (spec.link) {
    [].concat(spec.link).forEach(function(link) {
      buf.push('<link ' + createAttrs(link) + '>');
    });
  }

  if (spec.script) {
    [].concat(spec.script).forEach(function(script) {
      buf.push('<script ' + createAttrs(script) + '></script>');
    });
  }

  if (spec.code) {
    [].concat(spec.code).forEach(function(code) {
      buf.push('<script>' + code + '</script>');
    });
  }

  buf = buf.concat(
    '</head>',
    '<body>' + (spec.body ? spec.body : '') + '</body>',
    '</html>');

  return buf.join('\n');
}

module.exports = createPage;
