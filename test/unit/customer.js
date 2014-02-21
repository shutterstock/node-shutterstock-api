require('should');
var Api = require('../../lib/index');
var mockHelper = require('../setup/helper');
var Q = require('q');
var mockCredentials = require('../setup/credentials.json');
var mockSubscriptions = require('../data/get_200_subscriptions.json');
var mockLightboxes = require('../data/get_200_lightboxes.json');
var mockLightbox = require('../data/get_200_lightbox.json');
var mockDownloads = require('../data/get_200_downloads.json');

describe('Customer', function() {

	var api = new Api(mockCredentials.apiUser, mockCredentials.apiKey, {logLevel: 'WARN'});

	before(function(done){
		var scope = mockHelper(mockCredentials).mockAuth();
		api.auth(mockCredentials.username, mockCredentials.password, function() {
			scope.done();
			done();
		});
	});

	describe('subscriptions', function() {
		var scope;

		beforeEach(function(){
			scope = mockHelper().nock()
			.get('/customers/' + mockCredentials.username +
				'/subscriptions.json?auth_token=' + mockCredentials.mock_auth_token)
			.reply(200, mockSubscriptions);
		});

		function assertions(subscriptions){
			subscriptions.should.be.instanceOf(Array);
			subscriptions.should.have.length(4);
		}

		it('should call back with a list of subscriptions', function(done) {
			api.customer().subscriptions(function(err, subscriptions) {
				assertions(subscriptions);			
				scope.isDone().should.be.true;
				done();
			});
		});

		it('should return a promise with a list of subscriptions', function(done) {
			var promise = api.customer().subscriptions();
			promise.then(assertions).done(done);
		});
	});

	describe('findSubscriptions', function() {
		function assertions(subscriptions){
			subscriptions.should.have.length(2);
		}
		
		it('should call back with filtered results', function(done) {
			api.customer().findSubscriptions({license: 'enhanced'}, function(err, subscriptions) {
				assertions(subscriptions);
				done();
			});
		});

		it('should return a promise with filtered results', function(done){
			var promise = api.customer().findSubscriptions({license: 'enhanced'});
			Q.isPromise(promise).should.be.true;
			promise.then(assertions).done(done);
		});
	});

	describe('lightboxes', function() {
		var scope;

		beforeEach(function(){
			scope = mockHelper().nock()
				.get('/customers/' + mockCredentials.username + 
					'/lightboxes.json?auth_token=' + 
					mockCredentials.mock_auth_token)
				.reply(200, mockLightboxes);
		});

		function assertions(lightboxes){
			lightboxes.should.be.instanceOf(Array);
			lightboxes.should.have.length(3);
			lightboxes[0].images.should.be.instanceof(Array);
			lightboxes[0].should.have.property('image_count');
			lightboxes[0].should.have.property('lightbox_name');
			lightboxes[0].should.have.property('lightbox_id');
			lightboxes[0].should.have.property('resource_url');
		}
		it('should call back with a list of lightboxes', function(done) {
			api.customer().lightboxes(function(err, lightboxes) {
				assertions(lightboxes);
				scope.isDone().should.be.true;
				done();
			});
		});
		it('should return a promise with a list of lightboxes', function(done) {
			var promise = api.customer().lightboxes();
			Q.isPromise(promise).should.be.true;
			promise.then(assertions).done(done);  
		});
	});

	describe('lightbox', function() {
		var scope;

		beforeEach(function(){
			scope = mockHelper().nock()
				.get('/lightboxes/' + 1 + '.json?auth_token=' + 
					mockCredentials.mock_auth_token)
				.reply(200, mockLightbox);
		});

		function assertions(lightbox){
			lightbox.images.should.be.instanceof(Array);
			lightbox.images.should.have.length(4);
			lightbox.should.have.property('image_count');
			lightbox.should.have.property('lightbox_name');
			lightbox.should.have.property('lightbox_id');
		}

		it('should call back with a lightbox', function(done) {
			api.customer().lightbox(1, function(err, lightbox) {
				assertions(lightbox);
				scope.isDone().should.be.true;
				done();
			});
		});
		it('should return a promise with a lightbox', function(done) {
			var promise = api.customer().lightbox(1);
			Q.isPromise(promise).should.be.true;
			promise.then(assertions).done(done);  
		});
	});

	describe('image downloads', function() {
		var scope;

		beforeEach(function(){
			scope = mockHelper().nock()
				.get('/customers/' + mockCredentials.username + 
					'/images/downloads.json?auth_token=' + 
					mockCredentials.mock_auth_token + '&page_size=40&page=1')
				.reply(200, mockDownloads);
		});

		function assertions(downloads){
			downloads.should.be.instanceof(Object);
			downloads['1'].should.be.instanceof(Array);
			downloads['1'][1].should.have.property('image_size');
			downloads['1'][1].should.have.property('user');
			downloads['1'][1].should.have.property('license');
		}

		it('should call back with downloads', function(done) {
			api.customer().imageDownloads(1, 40, function(err, downloads) {
				assertions(downloads);
				scope.isDone().should.be.true;
				done();
			});
		});

		it('should return a promise with downloads', function(done) {
			var promise = api.customer().imageDownloads(1, 40);
			Q.isPromise(promise).should.be.true;
			promise.then(assertions).done(done);  
		});
	});

});
