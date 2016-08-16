angular.element(document).ready(() => {
	"use strict";

	angular.element(document).foundation();
	angular.element("[bolt-app]").each((index, appNode) => {
		var appName = angular.element(appNode).attr("bolt-app");
		angular.bootstrap(appNode, [appName]);
	});
});