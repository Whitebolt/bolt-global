'use strict';

const fs = require('fs');

function getBuffer(chunk) {
	let length = Object.keys(chunk).length;
	let buf = Buffer.alloc(length);
	for (let n=0; n<length; n++) buf[n] = chunk[n];
	return buf;
}

function emitReady(app, req, sizeToDo) {
	if ((sizeToDo <= 0)  && (app.uploadTracking.size(req.messageId) === 0)) {
		app.uploadTracking.emit(req.messageId, 'done');
	} else {
		app.uploadTracking.emit(req.messageId, 'ready');
	}
}

let exported = {
	index: function(component, req, done, app) {
		let sizeToDo = req.fileSize;
		let fileName = '/var/www/prayer-assistant/website/public/' + req.fileName;
		let ready = false;
		let count = 0;

		console.log(req.sessionID);

		function append(chunk) {
			ready = false;
			count++;
			let buf = getBuffer(chunk);
			sizeToDo -= buf.length;
			fs.appendFile(fileName, buf, (err, result)=>{
				ready = true;
				emitReady(app, req, sizeToDo);
			});
		}

		function destroy() {
			app.uploadTracking.clear(req.messageId);
			app.uploadTracking.removeAllListeners(req.messageId);
			req = undefined;
		}

		append(req.body);
		app.uploadTracking.on(req.messageId, eventType=>{
			if (((eventType === 'ready') || (eventType === 'chunk')) && ready) {
				let chunk = app.uploadTracking.next(req.messageId);
				if (chunk) append(chunk);
			} else if (eventType === 'done') destroy();
		});

		done();
	}
};

module.exports = exported;