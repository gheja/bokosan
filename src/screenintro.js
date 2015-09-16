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
	if (this.scrollerPosition < 70)
	{
		s = "MONDAY, 07:50\n"+
			"\n" +
			"IN 10 MINUTES YOUR FIST DAY WILL BEGIN OF YOUR NEW\n" +
			"JOB AS A WAREHOUSE KEEPER.\n";
			
		game.drawSmallText(0, 150, s.substr(0, this.scrollerPosition * 3));
		if (this.scrollerPosition < 35)
		{
			game.synth.playSound(SOUND_TEXT);
		}
	}
	else // if (this.scrollerPosition < 60)
	{
		s = "MR BOSS:\n" +
			"  LOREM IPSUM DOLOR SIT AMET PEOPLE WE HIRED IN THE\n" + 
			"  LAST 30 YEARS TO PUT EVERYTHING IN PLACE BUT ASDFG\n" +
			"  THAT WAS A HUGE MISTAKE AND...\n";
		
		game.drawSmallText(0, 150, s.substr(0, (this.scrollerPosition - 70) * 3));
		
		if (this.scrollerPosition < 120)
		{
			game.synth.playSound(SOUND_TEXT);
		}
	}
	
	if (this.scrollerPosition > 140)
	{
		game.drawTouchToContinue(96, 270);
	}
}
