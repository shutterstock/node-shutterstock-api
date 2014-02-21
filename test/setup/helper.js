'use strict';

var nock = require('nock');

// A small helper for constructing mock SS API handlers with nock.

function MockAPI(options){
	if (!(this instanceof MockAPI)) { return new MockAPI(options); }
	options = options || {};
	this.protocol = options.protocol || 'http';  
	this.host = options.host || 'api.shutterstock.com';
	this.username = options.username || 'api_username';
	this.password = options.password || 'password';
	this.apiUser = options.apiUser || 'api_user';
	this.apiKey = options.apiKey || 'api_key';
	this.mockToken = options.mockToken || 'mock_auth_token'; 
	this._nock = nock(this.baseUrl());
}

MockAPI.prototype.mockAuth = function(){
	return this._nock = nock(this.baseUrl())
		.post('/auth/customer.json', 
				{ username: this.username, password: this.password })
	.reply(200, this.authResponse());
};

MockAPI.prototype.nock = function(){
	return this._nock = nock(this.baseUrl());
};

MockAPI.prototype.baseUrl = function(){
	return this.protocol + '://' + this.host;
};

MockAPI.prototype.authResponse = function(){
	return {
		language: 'en',
			auth_token: this.mockToken,
			username: this.username
	};
};

module.exports = MockAPI;
