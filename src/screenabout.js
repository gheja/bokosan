"use strict";

/**
 * @constructor
 */
var ScreenAbout = function()
{
}

ScreenAbout.prototype = new Screen2();

ScreenAbout.prototype.init = function(game)
{
	game.setWaitForKeypress(SCREEN_MENU);
}

ScreenAbout.prototype.tick = function(game)
{
}

ScreenAbout.prototype.draw = function(game)
{
	game.drawSmallText(0, 270, "(ABOUT SCREEN)");
}
