"use strict";

/**
 * @constructor
 * @extends {Obj}
 * @param {Game} game
 * @param {number} x
 * @param {number} y
 */
var BoxObj = function(game, x, y)
{
	this.game = game;
	this.x = x;
	this.y = y;
	this.tileNumber = 1;
	this.isBox = true;
}

BoxObj.prototype = new Obj(0, 0, 0);
