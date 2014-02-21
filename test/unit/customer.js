require('should');
var Api = require('../../lib/index');
var mockHelper = require('../setup/helper');
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
		it('should return a list of subscriptions', function(done) {
			var scope = mockHelper().nock()
			.get('/customers/' + mockCredentials.username +'/subscriptions.json?auth_token=' + mockCredentials.mock_auth_token)
			.reply(200, mockSubscriptions);
			api.customer().subscriptions(function(err, subscriptions) {
				subscriptions.should.be.instanceOf(Array);
				subscriptions.should.have.length(4);
				scope.isDone().should.be.true;
				done();
			});
		});
	});

	describe('findSubscriptions', function() {
		it('should filter by license type', function() {
			api.customer().findSubscriptions({license: 'enhanced'}, function(err, subscriptions) {
				subscriptions.should.have.length(2);
			});
		});
	});

	describe('lightboxes', function() {
		it('should return a list of lightboxes', function(done) {
			var scope = mockHelper().nock()
			.get('/customers/' + mockCredentials.username +'/lightboxes.json?auth_token=' + mockCredentials.mock_auth_token)
			.reply(200, mockLightboxes);
			api.customer().lightboxes(function(err, lightboxes) {
				lightboxes.should.be.instanceOf(Array);
				lightboxes.should.have.length(3);
				lightboxes[0].images.should.be.instanceof(Array);
				lightboxes[0].should.have.property('image_count');
				lightboxes[0].should.have.property('lightbox_name');
				lightboxes[0].should.have.property('lightbox_id');
				lightboxes[0].should.have.property('resource_url');
				scope.isDone().should.be.true;
				done();
			});
		});
	});

	describe('lightbox', function() {
		it('should return a lightbox', function(done) {
			var scope = mockHelper().nock()
			.get('/lightboxes/' + 1 + '.json?auth_token=' + mockCredentials.mock_auth_token)
			.reply(200, mockLightbox);
			api.customer().lightbox(1, function(err, lightbox) {
				lightbox.images.should.be.instanceof(Array);
				lightbox.images.should.have.length(4);
				lightbox.should.have.property('image_count');
				lightbox.should.have.property('lightbox_name');
				lightbox.should.have.property('lightbox_id');
				scope.isDone().should.be.true;
				done();
			});
		});
	});

	describe('image downloads', function() {
		it('should return downloads', function(done) {
			var scope = mockHelper().nock()
			.get('/customers/' + mockCredentials.username + '/images/downloads.json?auth_token=' + mockCredentials.mock_auth_token + '&page_size=40&page=1')
			.reply(200, mockDownloads);
			api.customer().imageDownloads(1, 40, function(err, downloads) {
				downloads.should.be.instanceof(Object);
				downloads['1'].should.be.instanceof(Array);
				downloads['1'][1].should.have.property('image_size');
				downloads['1'][1].should.have.property('user');
				downloads['1'][1].should.have.property('license');
				scope.isDone().should.be.true;
				done();
			});
		});
	});

});
