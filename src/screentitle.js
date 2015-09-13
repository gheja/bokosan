"use strict";

/**
 * @constructor
 * @extends {Screen}
 */
var ScreenTitle = function()
{
}

ScreenTitle.prototype = new Screen2();

ScreenTitle.prototype.draw = function(game)
{
	game.drawBigText(146, 80, "BOKOSAN");
	game.drawSmallText(122, 100, "FOR JS13KGAMES 2015\n\n  WWW.BOKOSAN.NET");
	game.drawTouchToContinue(96, 200);
}
