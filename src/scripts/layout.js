(function($) {
	"use strict";

	function theme(name) {
		$('body').removeClass(function() { return $( this ).attr( "class" ); }).addClass(name);
	}

	var mainWidth = 800;

	let components = window.components = {};
	let selector = window.selector = {};
	let action = window.action = {};
	let contextMenu = window.contextMenu = {};
	let barHeight = window.barHeight = 0;

	components.isOpen = false;
	components.minWidth = 160;
	components.maxWidth = 200;
	components.zIndex = 50;

	selector.isOpen = false;
	selector.minWidth = 400;
	selector.maxWidth = 500;
	selector.zIndex = 40;

	action.isOpen = false;
	action.minWidth = 640;
	action.maxWidth = 2000;
	action.zIndex = 60;

	contextMenu.isOpen = false;
	contextMenu.minWidth = 200;
	contextMenu.maxWidth = 300;
	contextMenu.zIndex = 20;

	function layout(actionWidth) {
		var h = $(window).height();
		var w = $(window).width();
		if (w > 640) barHeight = 50; else barHeight = 30;
		$("#w").html(w);
		var smallPanel, bigPanel, panelHeight;
		bigPanel = (w - actionWidth) / 2;
		smallPanel = bigPanel / 2;
		panelHeight = h - barHeight;

		var panelWidth = {};
		var nextPosition;
		panelWidth.components = smallPanel;
		if (panelWidth.components < components.minWidth) panelWidth.components = components.minWidth;
		if (panelWidth.components > components.maxWidth) panelWidth.components = components.maxWidth;
		if (panelWidth.components > w || w <= 640) panelWidth.components = w;

		panelWidth.selector = bigPanel;
		if (panelWidth.selector < selector.minWidth) panelWidth.selector = selector.minWidth;
		if (panelWidth.selector > selector.maxWidth) panelWidth.selector = selector.maxWidth;
		if (panelWidth.selector > w || w <= 640) panelWidth.selector = w;

		panelWidth.action = actionWidth;
		if (panelWidth.action < action.minWidth) panelWidth.action = action.minWidth;
		if (panelWidth.action > action.maxWidth) panelWidth.action = action.maxWidth;
		if (panelWidth.action > w || w <= 640) panelWidth.action = w;

		panelWidth.contextMenu = smallPanel;
		if (panelWidth.contextMenu < contextMenu.minWidth) panelWidth.contextMenu = contextMenu.minWidth;
		if (panelWidth.contextMenu > contextMenu.maxWidth) panelWidth.contextMenu = contextMenu.maxWidth;
		if (panelWidth.contextMenu > w || w <= 640) panelWidth.contextMenu = w;

		nextPosition = 0;
		$("#components").width(panelWidth.components+"px").height(panelHeight).css({top:barHeight+"px",left: nextPosition+"px"});
		if (($("#components").position().left) > w - panelWidth.components) { $("#components").css({"z-index":60, left: (w - panelWidth.components)+"px"}); } else { $("#components").css({"z-index": components.zIndex});}
		if (components.isOpen) nextPosition += panelWidth.components;


		$("#selector").width(panelWidth.selector+"px").height(panelHeight).css({top:barHeight+"px",left:nextPosition+"px"});
		if (($("#selector").position().left) > w - panelWidth.selector) { $("#selector").css({"z-index":70, left: (w - panelWidth.selector)+"px"}); } else { $("#selector").css({"z-index": selector.zIndex});}
		if (selector.isOpen) nextPosition += panelWidth.selector;


		$("#action").width(panelWidth.action+"px").height(panelHeight).css({top:barHeight+"px",left:nextPosition+"px"});
		if (($("#action").position().left) > w - panelWidth.action) { $("#action").css({"z-index":80, left: (w - panelWidth.action)+"px"}); } else { $("#action").css({"z-index": action.zIndex});}
		if (action.isOpen) nextPosition += panelWidth.action;

		$("#contextMenu").width(panelWidth.contextMenu+"px").height(panelHeight).css({top:barHeight+"px",left:nextPosition+"px"});
		if (($("#contextMenu").position().left) > w - panelWidth.contextMenu) { $("#contextMenu").css({"z-index":90, left: (w - panelWidth.contextMenu)+"px"}); } else { $("#contextMenu").css({"z-index": contextMenu.zIndex});}
	}

	$(document).ready(function(){
		layout(mainWidth);
		components.open();
		selector.open();
		action.open(800);
	});

	$(window).resize(function(){
		layout(mainWidth);
	});

	components.open = function() { components.isOpen = true; layout(mainWidth); $("#components").show(100); layout(mainWidth); }
	components.close = function() { components.isOpen = false; layout(mainWidth); $("#components").hide(100); layout(mainWidth); }
	selector.open = function() { selector.isOpen = true;  layout(mainWidth); $("#selector").show(100); layout(mainWidth); }
	selector.close = function() { selector.isOpen = false; layout(mainWidth); $("#selector").hide(100); layout(mainWidth); }
	action.open = function(width) { mainWidth = width; action.isOpen = true; layout(width); $("#action").show(100); layout(width); }
	action.close = function() { action.isOpen = false; layout(mainWidth); $("#action").hide(100); layout(mainWidth); }
	contextMenu.open = function() { contextMenu.isOpen = true;  layout(mainWidth); $("#contextMenu").show(100); layout(mainWidth); }
	contextMenu.close = function() { contextMenu.isOpen = false; layout(mainWidth); $("#contextMenu").hide(100); layout(mainWidth); }

})(jQuery);