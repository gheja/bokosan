"use strict";

/**
 * @constructor
 * @extends {Screen}
 */
var ScreenTitle = function()
{
}

ScreenTitle.prototype = new Screen2();

ScreenTitle.prototype.init = function(game)
{
}

ScreenTitle.prototype.tick = function(game)
{
}

ScreenTitle.prototype.draw = function(game)
{
	game.drawBigText(146, 80, "BOKOSAN");
	game.drawSmallText(122, 100, "FOR JS13KGAMES 2015\n\n  WWW.BOKOSAN.NET");
	if (game.isTouchAvailable())
	{
		game.drawSmallTextBlinking(96, 200, "TOUCH ANYWHERE TO CONTINUE");
	}
	else
	{
		game.drawSmallTextBlinking(104, 200, "PRESS A KEY TO CONTINUE");
	}
}
