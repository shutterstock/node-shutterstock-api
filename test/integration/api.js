require('should');
var Api = require('./../../lib/index');
var credentials = require('./credentials.json');

/*
 * Create a new API instance
 */
var api = new Api(credentials.apiuser, credentials.apikey);

/*
 * Reference values
 */
var lightboxId;
var authenticatedCustomer;

/*
 * Basic tests
 */
describe('API', function() {

	it('should authenticate', function(done) {
		api.auth(credentials.username, credentials.password, function(err, customer) {
			customer.should.have.property('username', credentials.username);
			authenticatedCustomer = customer;
			done();
		});
	});

	it('should get categories', function(done) {
		api.categories(function(err, categories) {
			categories.should.be.instanceof(Array);
			categories.should.have.lengthOf(26);
			done();
		});
	});

	it('should get an image', function(done) {
		api.image(200000, function(err, data) {
			data.should.have.property('photo_id', 200000);
			data.should.have.property('submitter', 'irina');
			data.should.have.property('description', 'one yellow-red tulip in the field of red');
			done();
		});
	});

	it('should search for images', function(done) {
		api.searchImages({
			searchterm: 'tigers',
			search_group: 'vectors',
			safesearch: 0,
			page_number: 1,
			sort_method: 'popular'
		}, function(err, data) {
			data.should.have.property('page', '1');
			data.should.have.property('sort_method', 'popular');
			data.results.should.be.instanceof(Array);
			data.results.should.have.property('length', 150);
			done();
		});
	});

	it('should get a video', function(done) {
		api.video(1042708, function(err, data) {
			data.should.have.property('video_id', 1042708);
			data.should.have.property('submitter_id', 511126);
			data.should.have.property('description', 'Traffic Lights at night timelapse');
			done();
		});
	});

	it('should search for videos', function(done) {
		api.searchVideos({
			searchterm: 'monkeys',
			page_number: 1,
			sort_method: 'popular'
		}, function(err, data) {
			data.should.have.property('page', '1');
			data.results.should.be.instanceof(Array);
			data.results.should.have.property('length', 150);
			done();
		});
	});

	it('should get subscriptions', function(done) {
		authenticatedCustomer.subscriptions(function(err, subscriptions) {
			subscriptions.should.be.instanceof(Array);
			done();
		});
	});

	it('should get lightboxes', function(done) {
		authenticatedCustomer.lightboxes(function(err, lightboxes) {
			lightboxes.should.be.instanceof(Array);
			lightboxId = lightboxes[0].lightbox_id;
			done();
		});
	});

	it('should get a lightbox', function(done) {
		authenticatedCustomer.lightbox(lightboxId, function(err, lightbox) {
			lightbox.should.have.property('lightbox_id', lightboxId);
			lightbox.images.should.be.instanceof(Array);
			done();
		});
	});

});
