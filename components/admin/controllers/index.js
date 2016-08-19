'use strict';

const Promise = module.parent.require("bluebird");

function getPages(component) {
	let req = component.req;

	return req.app.db.collection('pages').find({}, {_id:1, title:1, path:1}).toArray().then(docs => {
		component.done = true;
		component.sent = true;

		docs = docs.concat(docs).concat(docs).concat(docs).concat(docs).concat(docs).concat(docs);

		component.res.json({
			data: docs,
			title: "Please select a page to edit"
		});
		return component;
	});
}

let exported = {
	index: function(component) {
		component.template = "admin";
		component.done = true;

		return Promise.resolve(component);
	},

	getCollection: function(component) {
		let req = component.req;
		if ((req.method.toLowerCase() === 'post') && req.body && req.body.collection) {
			if (req.body.collection === 'pages') {
				return getPages(component);
			}
		}



		return Promise.resolve(component);
	},

	getMainNavBar: function(component) {
		let req = component.req;
		if (req.method.toLowerCase() === 'post') {
			component.res.json({
				data: [{
					title: "CMS",
					iconSrc: "http://icons.iconarchive.com/icons/grafikartes/flat-retro-modern/32/iPhoto-icon.png",
					action: "AdminPanelOpen",
					data: "CMS"
				}, {
					title: "Clear All",
					iconSrc: "http://icons.iconarchive.com/icons/grafikartes/flat-retro-modern/32/settings-icon.png",
					action: "AdminClearAll"
				}, {
					title: "Modules",
					iconSrc: "http://icons.iconarchive.com/icons/dakirby309/windows-8-metro/32/Apps-Live-Messenger-Metro-icon.png",
					action: "AdminPanelOpen",
					data: "modules"
				}]
			});
		}

		return Promise.resolve(component);
	},

	getAdminPanel: function(component) {
		let req = component.req;
		if ((req.method.toLowerCase() === 'post') && req.body && req.body.data) {
			if (req.body.data === 'CMS') {
				component.res.json({
					badge: {
						title: 'CMS',
						iconSrc: 'http://icons.iconarchive.com/icons/grafikartes/flat-retro-modern/128/iPhoto-icon.png'
					},
					menu: [{
						title: "Pages",
						action: "AdminPanel2Open",
						data: "*",
						src: "/admin/pages/getPages"
					}, {
						title: "Blog",
						action: "AdminPanel2Open",
						data: "*",
						src: "/admin/blog/getBlog"
					}, {
						title: "Menus",
						action: "AdminPanel2Open",
						data: "*",
						src: "/admin/menu/getMenus"
					}, {
						title: "Users",
						action: "AdminPanel2Open",
						data: "*",
						src: "/admin/users/getUsers"
					}]

				});
			} else if (req.body.data === 'modules') {
				component.res.json({
					badge: {
						title: 'Modules',
						iconSrc: 'http://icons.iconarchive.com/icons/dakirby309/windows-8-metro/128/Apps-Live-Messenger-Metro-icon.png'
					}
				});
			}
		}

		return Promise.resolve(component);
	}
};

module.exports = exported;