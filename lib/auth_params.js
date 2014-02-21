var und = require('underscore');

module.exports = function(auth_data) {
	return {
		username: auth_data.username,
		language: auth_data.language,
		injectAuthToken: function(params) {
			return und.defaults({}, { auth_token: auth_data.auth_token }, params);
		}
	};
};
