var should = require('should');
var Api = require('../../lib/index');
var mockHelper = require('../setup/helper');
var mockCredentials = require('../setup/credentials.json');
var pagedImageSearch = {	page1: require('../data/get_200_search_page_1.json'),
													page2: require('../data/get_200_search_page_2.json')	};
var Q = require('q');
var es = require('event-stream');

describe('ShutterstockAPIClient', function() {

	// change log level to INFO for armrest trace info.
	var api = new Api(mockCredentials.apiUser, mockCredentials.apiKey, {logLevel: 'WARN'});

	describe('constructor', function() {
		it('should set the auth property', function() {
			var clientAuth = mockCredentials.apiUser + ':' + mockCredentials.apiKey;
			api.client().auth.should.equal(clientAuth);
		});
	});

	describe('auth', function() {
		var scope;

		beforeEach(function(){
			scope = mockHelper(mockCredentials).mockAuth();
		});

		function assertions(customer){
			var authParams = customer._authParams.injectAuthToken();
			customer.should.have.property('username', mockCredentials.username);
			authParams.should.have.property('auth_token', mockCredentials.mock_auth_token);
		}

		it('should call back with a Customer object', function(done) {
			api.auth(mockCredentials.username, mockCredentials.password, function(err, customer) {
				assertions(customer);
				should(scope.isDone()).be.true;
				done();
			});
		});

		it('should return a promise with a Customer object', function(done) {
			var promise = api.auth(mockCredentials.username, mockCredentials.password);
			Q.isPromise(promise).should.be.true;
			promise.then(assertions).done(done);
		});
	});

	describe('categories', function() {
		var scope;

		beforeEach(function(){
			scope = mockHelper().nock()
			.get('/categories.json')
			.reply(200, [{category_id: '1', category_name: 'Testing'}]);
		});

		function assertions(categories){
			categories.should.be.instanceOf(Array);
			categories.should.have.length(1);
			categories[0].should.have.property('category_id', '1');
		}

		it('should call back with a list of categories', function(done) {
			api.categories(function(err, categories) {
				assertions(categories);
				scope.isDone().should.be.true;
				done();
			});
		});

		it('should return a promise with a list of categories', function(done) {
			var promise = api.categories();
			Q.isPromise(promise).should.be.true;
			promise.then(assertions).done(done);
		});
	});

	describe('image search', function() {
		var scope;

		beforeEach(function(){
			scope = mockHelper().nock()
			.get('/images/search.json?searchterm=tigers&search_group=vectors&safesearch=0&page_number=1&sort_method=popular')
			.reply(200, pagedImageSearch.page1);
		});

		function assertions(results){
			results.should.have.property('page', '1');
			results.should.have.property('sort_method', 'popular');
			results.results.should.be.instanceof(Array);
			results.results.should.have.property('length', 150);
		}

		it('should call back with a list of results', function(done){
			api.searchImages({
				searchterm: 'tigers',
				search_group: 'vectors',
				safesearch: 0,
				page_number: 1,
				sort_method: 'popular'
			}, function(err, results) {
				assertions(results);
				scope.isDone().should.be.true;
				done();
			});
		});

		it('should return a promise with a paged list of results', function(done){
			var promise = api.searchImages({
				searchterm: 'tigers',
				search_group: 'vectors',
				safesearch: 0,
				page_number: 1,
				sort_method: 'popular'});
			Q.isPromise(promise).should.be.true;
			promise.then(assertions).done(done);
		});

	});

	describe('stream image search', function() {
		var scope;

		beforeEach(function(){
			scope = mockHelper().nock()
			.get('/images/search.json?searchterm=tigers&search_group=vectors&safesearch=0&sort_method=popular&page_number=1')
			.reply(200, pagedImageSearch.page1)
			.get('/images/search.json?searchterm=tigers&search_group=vectors&safesearch=0&sort_method=popular&page_number=2')
			.reply(200, pagedImageSearch.page2);
		});

		function assertions(readStream){
			readStream.should.have.property('readable', true);
		}

		it('should call back with a readable stream', function(done){
			api.streamSearchImages({
				searchterm: 'tigers',
				search_group: 'vectors',
				safesearch: 0,
				sort_method: 'popular'
			}, function(err, readStream) {
				assertions(readStream);
				done();
			});
		});

		// it('should return a promise with a paged list of results', function(done){
		// 	var promise = api.searchImages({
		// 		searchterm: 'tigers',
		// 		search_group: 'vectors',
		// 		safesearch: 0,
		// 		page_number: 1,
		// 		sort_method: 'popular'});
		// 	Q.isPromise(promise).should.be.true;
		// 	promise.then(assertions).done(done);
		// });

	});

});
