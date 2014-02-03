
/**
 * Module dependencies.
 */

var req = require('request');
var qs = require('querystring');
var debug = require('debug')('wp-oauth');

/**
 * Default options
 */

var def = {
  response_type: "code",
  url: {
    redirect: '/wpoauth/connected'
  },
  endpoint: {
    request_token:  "https://public-api.wordpress.com/oauth2/token",
    authorize:      "https://public-api.wordpress.com/oauth2/authorize",
    authenticate:   "https://public-api.wordpress.com/oauth2/authenticate"
  }
};

/**
 * Options
 */

var _options;

/**
 * Class constructor
 *
 * @param {Object} options
 *
 * @api public
 */

function WPOAuth(options){
  if (!(this instanceof WPOAuth)) return new WPOAuth(options);
  // Options
  this.opts = _options = options || {};

  this.opts.url = this.opts.url || def.url;
  this.opts.response_type = this.opts.response_type || def.response_type;
  this.opts.endpoint = this.opts.endpoint || def.endpoint;

  // Error exceptions
  if (!this.opts.client_id) {
    return new Error('`client_id` is required');
  }

  if (!this.opts.client_secret) {
    return new Error('`client_secret` is required');
  }
};

/**
 * Get url to connect
 *
 * @api public
 */

WPOAuth.prototype.urlToConnect = function(resource){
  return WPOAuth.urlToConnect(resource);
};

/**
 * Set code to build the request for the oauth
 *
 * @param {String} code
 * @api public
 */

WPOAuth.prototype.setCode = function(code){
  debug('code: `%s`', code);
  this.code = code;
};

/**
 * Send request for token
 *
 * @param {Function} fn callback
 * @api public
 */

WPOAuth.prototype.requestAccessToken = function(fn){
  if (undefined == typeof this.code) {
    return fn(new Error('`code` is really needed'));
  }

  var data = { form: {
    "client_id": this.opts.client_id,
    "client_secret": this.opts.client_secret,
    "redirect_uri": this.opts.url.redirect,
    "code": this.code,
    'grant_type': 'authorization_code'
  } };

  var url = this.opts.endpoint.request_token;

  req.post(url, data, function (err, res, body) {
    if (err) return fn(err);

    var obj;

    try {
      obj = JSON.parse(body);
      debug('oauth response: %j', obj);
    } catch(e) {
      return fn(e);
    }

    // api error response
    if (obj && obj.error) {
      return fn(obj);
    }

    fn(null, obj);
  });
};

/**
 * Statics
 */

/**
 * Return URL to connect
 * 
 * @param {String} resource (optional)
 * @return {String}
 * @api public
 */

WPOAuth.urlToConnect = function(resource){
  var params = {
    "response_type": _options.response_type,
    "client_id": _options.client_id,
    "redirect_uri": _options.url.redirect
  };

  if (resource) {
    debug('get url: %s', resource);
    params.blog = resource;
  }

  var link =  def.endpoint.authorize + '?' + qs.stringify(params);
  debug('url: `%s`', link);
  return link;
};

/**
 * expose `WPOAuth`
 */

module.exports = WPOAuth;
