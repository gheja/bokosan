"use strict";

/**
 * @constructor
 * @extends {Screen}
 */
var ScreenAbout = function() { }

ScreenAbout.prototype = new Screen2();

ScreenAbout.prototype.init = function(game)
{
	game.setWaitForKeypress(SCREEN_MENU);
}

ScreenAbout.prototype.draw = function(game)
{
	game.drawHeader();
	game.drawBigText(120, 50,
		"ZSOLT HEJA\n\n\n" +
		"GABOR HEJA"
	);
	game.drawSmallText(112, 70,
		"MUSIC AND LEVEL DESIGN\n" +
		"\n" +
		"\n" +
		"\n" +
		"\n" +
		"\n" +
		"   CODE AND GRAPHICS\n" +
		"\n" +
		"\n" +
		" VISIT WWW.BOKOSAN.NET"
	);
	game.drawTouchToContinue(96, 270);
}
