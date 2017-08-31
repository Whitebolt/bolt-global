'use strict';

const fs = require('fs');

let exported = {
	index: function(component, req, done) {
		let length = Object.keys(req.body).length;
		let buf = Buffer.alloc(length);
		for (let n=0; n<length; n++) buf[n] = req.body[n];

		fs.writeFile('/var/www/prayer-assistant/website/public/test.png', buf);
		done();
	}
};

module.exports = exported;