var request = require('request');
var path = require('path');
var fs = require('fs');

var LicensedMedia = function(type, data) {
	this.type = type;
	this.downloadUrl = data.download.url;
	this.thumbUrl = data.thumb_large.url;
	this.allotmentCharge = data.allotmentCharge;
};

LicensedMedia.prototype.downloadStream = function() {
	return request(this.downloadUrl);
};

LicensedMedia.prototype.download = function(destination, next) {
	var stream;
	if (destination) {
		var stats = fs.statSync(destination);
		if (stats.isFile()) {
			stream = fs.createWriteStream(destination);
		} else if (stats.isDirectory()) {
			destination = path.join(destination, path.basename(this.downloadUrl));
			stream = fs.createWriteStream(destination);
		} else {
			return next(new Error('Invalid destination specified! (not a file or a directory)'));
		}
	} else {
		return next(new Error('No destination specified!'));
	}
	var r = this.downloadStream();
	return r.on('response', function(response) {
		if (response.statusCode >= 400) {
			return next(new Error('Error downloading media'), response);
		}
		var pipe = r.pipe(stream);
		pipe.on('error', next);
		return pipe.on('finish', function() {
			return next(null, destination);
		});
	});
};

module.exports = LicensedMedia;
