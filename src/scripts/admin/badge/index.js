!function(directiveName="badge") {
	"use strict";

	angular.module("bolt.admin").directive(directiveName, [()=>{
		return {
			restrict: "AE",
			controllerAs: directiveName,
			scope: true,
			controller: function(){},
			templateUrl: "badge/index.html",
			bindToController: {
				iconSrc: "@",
				title: "@"
			}
		};
	}]);
}();
