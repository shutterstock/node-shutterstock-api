var should = require('should');
var Api = require('../../lib/index');
var mockHelper = require('../setup/helper');
var mockCredentials = require('../setup/credentials.json');
var Q = require('q');

describe('ShutterstockAPIClient', function() {

	var api = new Api(mockCredentials.apiUser, mockCredentials.apiKey);

	describe('constructor', function() {
		it('should set the auth property', function() {
			var clientAuth = mockCredentials.apiUser + ':' + mockCredentials.apiKey;
			api.client().auth.should.equal(clientAuth);
		});
	});

	describe('auth', function() {
		it('should return a populated Customer object', function(done) {
			var scope = mockHelper(mockCredentials).mockAuth();
			api.auth(mockCredentials.username, mockCredentials.password, function(err, customer) {
				var authParams = customer._authParams.injectAuthToken();
				customer.should.have.property('username', mockCredentials.username);
				authParams.should.have.property('auth_token', mockCredentials.mock_auth_token);
				should(scope.isDone()).be.true;
				done();
			});
		});
	});

	describe('categories', function() {
		var scope;

		beforeEach(function(){
			scope = mockHelper().nock()
			.get('/categories.json')
			.reply(200, [{category_id: '1', category_name: 'Testing'}]);
		});

		it('should return a promise', function(done) {
			var promise = api.categories();
			Q.isPromise(promise).should.be.true;
			promise.then(function(categories) {
				categories.should.be.instanceOf(Array);
				categories.should.have.length(1);
				categories[0].should.have.property('category_id', '1');
				scope.isDone().should.be.true;
			}).done(done);
		});

		it('should return a list of categories', function(done) {
			api.categories(function(err, data) {
				should.strictEqual(null, err);
				data.should.be.instanceOf(Array);
				data.should.have.length(1);
				data[0].should.have.property('category_id', '1');
				scope.isDone().should.be.true;
				done();
			});
		});

	});

});
