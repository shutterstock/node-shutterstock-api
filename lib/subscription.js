var und = require('underscore');

module.exports = function(s) {
	var now = Date.now() / 1000;
	s.id = s.subscription_id;
	delete s.subscription_id;

	s.is_active = s.unix_expiration_time > now;
	s.is_expired = !s.is_active;

	s.sizesForLicensing = und.uniq(
		und.values(s.sizes || {}).filter(function(s) {
			return s.name !== 'supersize' && (!s.format || s.format !== 'tiff');
		}).map(function(s) {
			return s.name;
		})
	);
	return s;
};
