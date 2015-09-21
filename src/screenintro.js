"use strict";

/**
 * @constructor
 * @extends {Screen}
 */
var ScreenIntro = function()
{
	this.tickCount = 0;
	this.scrollerPosition = 0;
}

ScreenIntro.prototype = new Screen2();

ScreenIntro.prototype.init = function(game)
{
	this.scrollerPosition = 0;
	game.playIntroMusic();
	if (game.firstRun)
	{
		game.setWaitForKeypress(SCREEN_HOWTO);
	}
	else
	{
		game.setWaitForKeypress(SCREEN_MENU);
	}
}

ScreenIntro.prototype.tick = function(game)
{
	this.tickCount++;
	this.scrollerPosition++;
}

ScreenIntro.prototype.draw = function(game)
{
	var s;
	
	//   1234567890123456789012345678901234567890123456789012
	s = "MONDAY, 18:50\n"+
		"\n" +
		"THIS IS YOUR FIRST NIGHT SHIFT AS A\n" +
		"WAREHOUSE KEEPER.\n" +
		"\n" +
		"YOUR JOB IS TO PULL BACK ALL THE BOXES\n" +
		"THAT WERE RESTLESSLY PUSHED INTO THE\n" +
		"WRONG PLACES BY YOUR DAYTIME COLLEAGUES\n" +
		"IN THE PAST 30 YEARS.\n" +
		"\n" +
		"YOUR BOSS SAID SOMETHING ABOUT UNUSUAL\n" +
		"ROOMS BUT THAT DOES NOT MATTER. PROBABLY.";
	
	game.drawSmallText(0, 110, s.substr(0, this.scrollerPosition * 3));
	
	if (this.scrollerPosition < 97)
	{
		game.synth.playSound(SOUND_TEXT);
	}
	
	if (this.scrollerPosition > 117)
	{
		game.drawTouchToContinue(96, 270);
	}
}
