"use strict";

/**
 * @constructor
 * @extends {Screen}
 */
var ScreenHowto = function() { }

ScreenHowto.prototype = new Screen2();

ScreenHowto.prototype.init = function(game)
{
	game.setWaitForKeypress(SCREEN_MENU);
}

ScreenHowto.prototype.draw = function(game)
{
/*
	game.drawHeader();
	game.drawBigText(0, 50, "KEYBOARD\n\n\n\n\nTOUCH DEVICE");
	game.drawSmallText(24, 70,
		"  u    MOVE UP\n" +
		"  d    MOVE DOWN\n" +
		"  <    MOVE LEFT\n" +
		"  >    MOVE RIGHT\n" +
		"SHIFT  NEXT/GRAB\n" +
		"  ESC  BACK\n" +
		"\n" +
		"\n" +
		"\n" +
		"\n" +
		"SWIPE ON RIGHT HALF OF THE SCREEN:\n" +
		"  MOVE\n" +
		"\n" +
		"TOUCH BOTTOM LEFT CORNER:\n" +
		"  NEXT/GRAB\n" +
		"\n" +
		"TOUCH TOP LEFT CORNER:\n" +
		"  BACK");
	game.drawTouchToContinue(96, 270);
*/
}
