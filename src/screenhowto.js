"use strict";

/**
 * @constructor
 * @extends {Screen}
 */
var ScreenHowto = function()
{
}

ScreenHowto.prototype = new Screen2();

ScreenHowto.prototype.init = function(game)
{
	game.setWaitForKeypress(SCREEN_MENU);
}

ScreenHowto.prototype.tick = function(game)
{
}

ScreenHowto.prototype.draw = function(game)
{
	game.drawSmallText(0, 270, "(HOWTO SCREEN)");
}
