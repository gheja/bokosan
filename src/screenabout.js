"use strict";

/**
 * @constructor
 * @extends {Screen}
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
	game.drawHeader();
	game.drawBigText(80, 50,
		"ZSOLT HEJA\n\n\n\n" +
		"     GABOR HEJA"
	);
	game.drawSmallText(80, 70,
		"MUSIC AND LEVEL DESIGN\n" +
		"@HEJAZS\n" +
		"SOUNDCLOUD.COM/ABCDEFGH\n" +
		"\n" +
		"\n" +
		"\n" +
		"\n" +
		"\n" +
		"          CODE AND GRAPHICS\n" +
		"          @GHEJA_\n" +
		"          GITHUB.COM/GHEJA"
	);
	
	game.drawSmallText(8, 210,
		"AND A BIG THANK YOU TO\n" +
		"  MARKUS NEUBRAND (@MNEUBRAND) FOR JSFXR\n" +
		"  RAY LARABIE (@TYPODERMIC) FOR THE JOYSTIX FONT\n" +
		"  ANDRZEJ MAZUR (@END3R) FOR ORGANIZING JS13KGAMES"
	);
/*
	game.drawSmallText(80, 60,
		"MUSIC AND LEVEL DESIGN\n" +
		"@HEJAZS * ABCDEFGHIJKLMNOPQRS\n" +
		"\n" +
		"\n" +
		"\n" +
		"\n" +
		"          CODE AND GRAPHICS\n" +
		"          @GHEJA_ * GITHUB.COM/GHEJA\n" +
		"\n" +
		"\n" +
		"   - AND A BIG THANK YOU TO -\n" +
		"\n" +
		"  MARKUS NEUBRAND (@MNEUBRAND)\n" +
		"          FOR JSFXR\n" +
		"\n" +
		"   RAY LARABIE  (@TYPODERMIC)\n" +
		"      FOR THE JOYSTIX FONT\n" +
		"\n" +
		"     ANDRZEJ MAZUR (@END3R)\n" +
		"         FOR JS13KGAMES"
	);
*/
	game.drawTouchToContinue(96, 270);
}
