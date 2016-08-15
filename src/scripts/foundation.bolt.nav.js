'use strict';

!function($) {

	class BoltNav {
		constructor(element, options) {
			console.log("constructor");

			this.$element = element;
			this.options = $.extend({}, BoltNav.defaults, this.$element.data(), options);

			this._init();

			Foundation.registerPlugin(this, "boltnav");
		}

		_init() {
			this._events();
		}

		_events() {
			console.log("events");
		}

		destroy() {
			Foundation.unregisterPlugin(this);
			console.log("destroy");
		}
	}

	BoltNav.defaults = { };

	Foundation.plugin(BoltNav, "boltnav");
}(jQuery);