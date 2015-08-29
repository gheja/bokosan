"use strict";

/**
 * @constructor
 */
var Menu = function(selection, items)
{
	/** @type {number} */ this.selection = selection;
	/** @type {Array} */ this.items = items;
}

Menu.prototype.step = function(direction)
{
	// this.selection = Math.min(Math.max(this.selection + direction, 0), this.items.length - 1);
	
	// ensure that the selection is valid, roll over if necessary
	this.selection = (this.selection + direction + this.items.length) % this.items.length;
}

Menu.prototype.go = function()
{
	this.items[this.selection][1]();
}
