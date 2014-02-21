var LicensedMedia = require('./licensed_media');
var und = require('underscore');

function validMetadata(customer, metadata) {
	var valid;
	if (customer.metadata_field_definitions) {
		valid = metadata || {};
		var missing = [];
		customer.metadata_field_definitions.forEach(function(md) {
			if (!valid.hasOwnProperty(md.name_api) || valid[md.name_api] === null) {
				valid[md.name_api] = '';
			}
			if (md.is_required === 1 && valid[md.name_api] === '') {
				missing.push(md.name_api);
			}
		});
		if (missing.length > 0) {
			throw new Error('Missing required metadata fields required for licensing: ' + missing.join(', '));
		}
		return JSON.stringify(valid);
	}
}

function clone(data) {
	return JSON.parse(JSON.stringify(data));
}

/*
 * Customer public interface
 */
var Customer = function(authParams, client) {
	this._authParams = authParams;
	this._client = client;
	this.username = authParams.username;
	this.language = authParams.language;
};

/*
 * Returns a lightbox for a customer
 */
Customer.prototype.lightbox = function(id, next) {
	next = next || function() {};
	var self = this;
	return self._client.get({
		url: '/lightboxes/' + id + '.json',
		params: self._authParams.injectAuthToken(),
		error: function(err, res) { return next(err, null, res); },
		success: function(data, res) { return next(null, data, res); }
	});
};

/*
 * Returns lightboxes for a customer
 */
Customer.prototype.lightboxes = function(next) {
	next = next || function() {};
	var self = this;
	if (this._lightboxes) {
		return next(null, clone(this._lightboxes));
	} else {
		return self._client.get({
			url: '/customers/' + self.username + '/lightboxes.json',
			params: self._authParams.injectAuthToken(),
			error: function(err, res) { return next(err, null, res); },
			success: function(data, res) {
				self._lightboxes = data;
				return next(null, clone(self._lightboxes), res);
			}
		});
	}
};

/*
 * Return subscriptions for a customer
 */
Customer.prototype.subscriptions = function(next) {
	next = next || function() {};
	var self = this;
	if (this._subscriptions) {
		var subscriptions = clone(this._subscriptions);
		next(null, subscriptions);
		return subscriptions;
	} else {
		return self._client.get({
			url: '/customers/' + self.username + '/subscriptions.json',
			params: self._authParams.injectAuthToken(),
			error: function(err, res) { return next(err, null, res); },
			success: function(data, res) {
				self._subscriptions = data;
				return next(null, clone(self._subscriptions), res);
			}
		});
	}
};

/*
 * Return downloads for a customer
 */
Customer.prototype.imageDownloads = function(page, per_page, next) {
	next = next || function() {};
	var self = this;
	var params = {
		page_size: per_page || 40,
		page: page || 1
	};
	return self._client.get({
		url: '/customers/' + self.username + '/images/downloads.json',
		params: self._authParams.injectAuthToken(params),
		error: function(err, res) { return next(err, null, res); },
		success: function(data, res) { return next(null, data, res); }
	});
};

/*
 * Return subscriptions for a customer
 */
Customer.prototype.findSubscriptions = function(criteria, next) {
	next = next || function() {};
	this.subscriptions(function(err, subscriptions, res) {
		if (err) {
			return next(err, null, res);
		} else {
			var result = und.where(subscriptions, criteria);
			return next(null, result, res);
		}
	});
};

/*
 * License a video
 */
Customer.prototype.licenseVideo = function(id, options, next) {
	next = next || function() {};
	var self = this;
	options.subscription = options.subscription || {};
	if (typeof options.subscription === 'number' || typeof options.subscription === 'string') {
		options.subscription = {id: options.subscription};
	}
	options.subscription.site = /^photo/;
	options.subscription.is_active = true;

	this.findSubscriptions(options.subscription, function(err, subscriptions) {
		if (subscriptions.length !== 1) {
			return next(new Error('No subscriptions matching ' + JSON.stringify(options.subscription)));
		}

		var s = subscriptions[0];
		if (!options.size && s.sizesForLicensing.length === 1) {
			options.size = s.sizesForLicensing[0];
		}

		if (s.sizesForLicensing.filter(function(size) { return size === options.size; }).length === 0) {
			return next(new Error('Invalid size'));
		}
		var body = {editorial_acknowledgement: options.editorial_acknowledgement || 0};
		try {
			body.metadata = validMetadata(self, options.metadata);
		} catch (e) {
			return next(e);
		}
		body = self._authParams.injectAuthToken(body);
		return self._client.post({
			url: '/subscriptions/' + s.id + '/video/' + id + '/sizes/' + options.size + '.json',
			params: body,
			error: function(err, res) { return next(err, null, res); },
			success: function(data, res) {
				return next(null, new LicensedMedia('video', data), res);
			}
		});
	});
};

/*
 * License an image
 */
Customer.prototype.licenseImage = function(id, options, next) {
	var self = this;
	options.subscription = options.subscription || {};
	if (typeof options.subscription === 'number' || typeof options.subscription === 'string') {
		options.subscription = {id: options.subscription};
	}
	options.subscription.site = /^video/;
	options.subscription.is_active = true;

	this.findSubscriptions(options.subscription, function(err, subscriptions) {
		if (subscriptions.length !== 1) {
			return next(new Error('No subscriptions matching ' + JSON.stringify(options.subscription)));
		}

		var s = subscriptions[0];
		if (!options.size && s.sizesForLicensing.length === 1) {
			options.size = s.sizesForLicensing[0];
		}

		if (s.sizesForLicensing.filter(function(size) { return size === options.size; }).length === 0) {
			return next(new Error('Invalid size'));
		}
		var body = {editorial_acknowledgement: options.editorial_acknowledgement || 0};
		try {
			body.metadata = validMetadata(self, options.metadata);
		} catch (e) {
			return next(e);
		}
		body.format = options.size === 'vector' ? 'eps' : 'jpg';
		body = self._authParams.injectAuthToken(body);
		self._client.post({
			url: '/subscriptions/' + s.id + '/images/' + id + '/sizes/' + options.size + '.json',
			params: body,
			error: function(err, res) { return next(err, null, res); },
			success: function(data, res) {
				return next(null, new LicensedMedia('image', data), res);
			}
		});
	});
};

module.exports = Customer;
