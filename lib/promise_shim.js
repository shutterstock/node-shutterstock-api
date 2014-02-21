var Q = require('q');

/*
 * Proxy http verb instance methods to return promises.
 */

module.exports = function(client) {

  ['GET', 'POST', 'PUT', 'HEAD', 'DELETE', 'OPTIONS'].forEach(function(method) {
    var instanceMethod = method.toLowerCase();

    client[instanceMethod] = function(options) {
      var _complete = options.complete || function() { };
      var deferred = Q.defer();

      options.complete = function(err, response, data) {
        _complete.call(client, err, response, data);
        if (err) {
          deferred.reject(err);
        }else {
          deferred.resolve(data);
        }
      };

      Object.getPrototypeOf(client)[instanceMethod].call(client, options);

      return deferred.promise;
    };
  });
};
