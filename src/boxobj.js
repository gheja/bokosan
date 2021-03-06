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
}

BoxObj.prototype = new Obj(0, 0, 0);

BoxObj.prototype.setSolvedStatus = function(status)
{
	if (status == true)
	{
		this.tileNumber = 22;
	}
	else
	{
		this.tileNumber = 1;
	}
}
