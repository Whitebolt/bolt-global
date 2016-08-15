'use strict';

!function($) {

	function _setupModal(instance) {
		let $element = instance.$element;
		let title = $element.data().sorterTitle;

		$element.addClass("reveal");
		if (title) $element.prepend("<h1>" + title + "</h1>");
		$element.append("<button class=\"close-button\" data-close aria-label=\"Close reveal\" type=\"button\"><span aria-hidden=\"true\">&times;</span></button>")
		new Foundation.Reveal($element, {});
	}


	class Sorter {
		constructor(element, options) {
			console.log("constructor");

			this.$element = element;
			this.options = $.extend({}, Sorter.defaults, this.$element.data(), options);

			this._init();

			Foundation.registerPlugin(this, "sorter");
		}

		_init() {
			_setupModal(this);
			this._events();
		}

		_events() {
			this.$element.on("closeme.zf.reveal", event => {
				console.log("Hello", event);
			});

			console.log("events");
		}

		destroy() {
			Foundation.unregisterPlugin(this);
			console.log("destroy");
		}
	}

	Sorter.defaults = { };

	Foundation.plugin(Sorter, "sorter");
}(jQuery);