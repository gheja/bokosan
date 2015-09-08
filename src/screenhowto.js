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
	game.drawHeader();
	game.drawBigText(0, 50, "KEYBOARD");
	game.drawSmallText(24, 70,
		" u  W  MOVE UP\n" +
		" d  S  MOVE DOWN\n" +
		" <  A  MOVE LEFT\n" +
		" >  D  MOVE RIGHT\n" +
		"SHIFT  ACCEPT/NEXT/GRAB\n" +
		"  ESC  CANCEL/BACK"
	);
	game.drawBigText(0, 150, "TOUCH DEVICE");
	game.drawSmallText(24, 170,
		"SWIPE ON THE RIGHT HALF OF THE SCREEN:\n" +
		"  MOVE IN SWIPE DIRECTION\n" +
		"\n" +
		"TOUCH BOTTOM LEFT CORNER:\n" +
		"  ACCEPT/NEXT/GRAB\n" +
		"\n" +
		"TOUCH TOP LEFT CORNER:\n" +
		"  CANCEL/BACK"
	);
	game.drawTouchToContinue(96, 270);
}
