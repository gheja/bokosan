"use strict";

/**
 * @constructor
 */
var ScreenIntro = function()
{
}

ScreenIntro.prototype = new Screen2();

ScreenIntro.prototype.init = function(game)
{
	game.setWaitForKeypress(SCREEN_MENU);
}

ScreenIntro.prototype.tick = function(game)
{
}

ScreenIntro.prototype.draw = function(game)
{
	game.drawSmallText(0, 270, "(INTRO SCREEN)");
}
