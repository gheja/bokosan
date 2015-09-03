"use strict";

/**
 * @constructor
 * @extends {Screen}
 */
var ScreenChallenges = function()
{
}

ScreenChallenges.prototype = new Screen2();

ScreenChallenges.prototype.init = function(game)
{
	game.setWaitForKeypress(SCREEN_MENU);
}

ScreenChallenges.prototype.tick = function(game)
{
}

ScreenChallenges.prototype.draw = function(game)
{
	game.drawSmallText(0, 270, "(CHALLENGES SCREEN)");
}
