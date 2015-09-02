"use strict";

/**
 * @constructor
 */
var ScreenLevels = function()
{
}

ScreenLevels.prototype = new Screen2();

ScreenLevels.prototype.init = function(game)
{
	game.setWaitForKeypress(SCREEN_GAME);
	game.loadLevel(1);
}

ScreenLevels.prototype.tick = function(game)
{
}

ScreenLevels.prototype.draw = function(game)
{
	game.drawSmallText(0, 270, "(LEVELS SCREEN)");
}
