"use strict";

/**
 * @constructor
 */
var ScreenMenu = function()
{
	this.tickCount = 0;
}

ScreenMenu.prototype = new Screen2();

ScreenMenu.prototype.init = function(game)
{
	game.openMenu(MENU_MAIN);
}

ScreenMenu.prototype.tick = function(game)
{
	if (game.inputHandler.isKeyActive(IH_KEY_UP))
	{
		game.currentMenu.step(-1);
		game.playSound(SOUND_MENU);
	}
	else if (game.inputHandler.isKeyActive(IH_KEY_DOWN))
	{
		game.currentMenu.step(1);
		game.playSound(SOUND_MENU);
	}
	else if (game.inputHandler.isKeyActive(IH_KEY_ACTION) || game.inputHandler.isKeyActive(IH_KEY_RIGHT))
	{
		game.currentMenu.go();
		game.playSound(SOUND_NEXT);
	}
	
	game.inputHandler.clearKeys();
	// game.inputHandler.clearReleasedKeys();
}

ScreenMenu.prototype.draw = function(game)
{
	var i;
	
	game.drawBigText(0, 0, "BOKOSAN");
	game.drawSmallText(0, 20, "FOR JS13KGAMES 2015");
	
	game.drawSmallText(0, 50, "TOTAL TIME PLAYED");
	game.drawBigText(0, 60, game.pad(game.timePad(game.statGetLocalStorageValue(STAT_FRAMES) * 1/12), 10, ' '));
	game.drawSmallText(0, 90, "TOTAL MOVES");
	game.drawBigText(0, 100, game.pad(game.thousandPad(game.statGetLocalStorageValue(STAT_MOVES)), 10, ' '));
	game.drawSmallText(0, 130, "TOTAL PULLS");
	game.drawBigText(0, 140, game.pad(game.thousandPad(game.statGetLocalStorageValue(STAT_PULLS)), 10, ' '));
	
	for (i=0; i<game.currentMenu.items.length; i++)
	{
		game.drawSmallText(200, 50 + i * 20, (game.currentMenu.selection == i ? "> " : "  ") + game.currentMenu.items[i][0]);
	}
	
	game.drawSmallText(0, 270, "WWW.BOKOSAN.NET             GITHUB.COM/GHEJA/BOKOSAN");
}
