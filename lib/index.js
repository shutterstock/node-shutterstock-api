var armrest = require('armrest');
var querystring = require('querystring');
var Customer = require('./customer');
var authParams = require('./auth_params');
var promiseShim = require('./promise_shim');
var es = require('event-stream');
var Q = require('q');

/*
 * A reference to the armrest client instance
 */
var client;
var customer;

/*
 * API public interface
 */
var Api = function(apiUser, apiKey, clientOptions) {
	clientOptions = clientOptions || {};
	clientOptions.base = clientOptions.base || 
		process.env.SS_API_HOST || 'http://api.shutterstock.com';

	client = armrest.client(clientOptions);
	client.auth = apiUser + ':' + apiKey;
	client.serializer = {
		contentType: 'application/x-www-form-urlencoded',
		serialize: querystring.stringify,
		deserialize: JSON.parse
	};

	// patch our client to return promises.
	promiseShim(client);
};

/*
 * Authenticates a user... returns a customer object
 */
Api.prototype.auth = function(username, password, next) {
	next = next || function() {};
	return client.post({
		url: '/auth/customer.json',
		params: {
			'username': username,
			'password': password
		},
		error: function(err, res) {
			return next(err, null, res);
		},
		success: function(data, res) {
			customer = new Customer(authParams(data), client);
			return next(null, customer, res);
		}
	}).then(function(data){
		return new Customer(authParams(data), client);
	});
};

/*
 * Returns the currently authenticated customer or undef if auth not called
 */
 Api.prototype.customer = function() {
	return customer;
 };

/*
 * Searches for matching images with paged results (caller must pass page numbers)
 */
function search(type, query, next) {
	next = next || function() {};
	return client.get({
		url: '/' + type + '/search.json',
		params: query,
		error: function(err, res) { return next(err, null, res); },
		success: function(data, res) { return next(null, data, res); }
	});
}


/*
 * Returns a readable stream of search results that lazy loads paged results as needed.
 */
function searchStream(type, query) {
	var buffered = [];
	query.page_number = 0;

	return es.readable(function (i, callback) {
		var self = this;
		if(i > buffered.length - 1 || query.page_number === 0) {
			
			query.page_number = query.page_number + 1;
			
			search(type, query, function(err, data){
				if(data.results.length === 0) { return self.emit('end'); }
				buffered = buffered.concat(data.results);
				callback(err, buffered[i]);
			});
		
		}else{
			callback(null, buffered[i]);
		}
	});
}

/*
 * Returns a set of categories
 */
Api.prototype.categories = function(next) {
	next = next || function() {};
	return client.get({
		url: '/categories.json',
		error: function(err, res) { return next(err, null, res); },
		success: function(data, res) { return next(null, data, res); }
	});
};

/*
 * Searches for images
 */
Api.prototype.searchImages = function(query, next) {
	return search('images', query, next);
};

/*
 * Searches for images
 */
Api.prototype.streamSearchImages = function(query, next) {
	return searchStream('images', query, next);
};

/*
 * Returns a single image
 */
Api.prototype.image = function(id, next) {
	next = next || function() {};
	return client.get({
		url: '/images/' + id + '.json',
		error: function(err, res) { return next(err, null, res); },
		success: function(data, res) { return next(null, data, res); }
	});
};

/*
 * Searches for videos
 */
Api.prototype.searchVideos = function(query, next) {
	return search('videos', query, next);
};

/*
 * Returns a single video
 */
Api.prototype.video = function(id, next) {
	return client.get({
		url: '/videos/' + id + '.json',
		error: function(err, res) { return next(err, null, res); },
		success: function(data, res) { return next(null, data, res); }
	});
};

/*
 * Accessor for the armrest client
 */
Api.prototype.client = function() {
	return client;
};

module.exports = Api;
