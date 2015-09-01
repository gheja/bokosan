"use strict";

/**
 * @constructor
 */
var Menu = function(game, items)
{
	/** @type {Game} */ this.game = game;
	/** @type {Array} */ this.items = items;
	/** @type {number} */ this.selection = 0;
}

Menu.prototype.step = function(direction)
{
	// this.selection = Math.min(Math.max(this.selection + direction, 0), this.items.length - 1);
	
	// ensure that the selection is valid, roll over if necessary
	this.selection = (this.selection + direction + this.items.length) % this.items.length;
}

Menu.prototype.go = function()
{
	if (this.items[this.selection][1] == ACTION_OPEN_MENU)
	{
		this.game.openMenu(this.items[this.selection][2]);
	}
	else
	{
		this.game.screenFadeAndSwitch(this.items[this.selection][2]);
	}
}
