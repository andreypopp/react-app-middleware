var React            = require('react-tools/build/modules/React');
var createController = require('react-app-controller');

var MainPage = React.createClass({
  render: function() {
    return (
      <div className="MainPage">
        <h1>Main page</h1>
        <p>state: {this.state}</p>
        <a href="/about">about</a>
        <a href="/data">data</a>
        <a href="/data-state">data-state</a>
      </div>
    );
  }
});

var AboutPage = React.createClass({
  render: function() {
    return (
      <div className="AboutPage">
        <h1>About page</h1>
        <p>state: {this.state}</p>
        <a href="/">index</a>
        <a href="/data">data</a>
        <a href="/data-state">data-state</a>
      </div>
    );
  }
});

var app = module.exports = createController({
  '/': MainPage,
  '/about': AboutPage
}, {
  started: function() {
    window.addEventListener('click', function(e) {
      if (e.target.tagName === 'A' && e.target.attributes.href) {
        e.preventDefault();
        app.navigate(e.target.attributes.href.value);
      }
    });
  }
});
