var React            = require('react');
var createController = require('react-app-controller');

module.exports = createController({
  routes: {},
  renderNotFound: function() {
    return React.DOM.div(null, 'NotFound');
  }
});

