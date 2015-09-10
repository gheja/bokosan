"use strict";

/**
 * @constructor
 * @extends {Screen}
 */
var ScreenMenu = function()
{
	this.tickCount = 0;
}

ScreenMenu.prototype = new Screen2();

ScreenMenu.prototype.init = function(game)
{
	game.synth.playSong(1);
	game.openMenu(MENU_MAIN);
}

ScreenMenu.prototype.tick = function(game)
{
	if (game.inputHandler.isKeyActive(IH_KEY_UP))
	{
		game.currentMenu.step(-1);
		game.synth.playSound(SOUND_MENU);
	}
	else if (game.inputHandler.isKeyActive(IH_KEY_DOWN))
	{
		game.currentMenu.step(1);
		game.synth.playSound(SOUND_MENU);
	}
	else if (game.inputHandler.isKeyActive(IH_KEY_ACTION) || game.inputHandler.isKeyActive(IH_KEY_RIGHT))
	{
		game.currentMenu.go();
		game.synth.playSound(SOUND_NEXT);
	}
	else if (game.inputHandler.isKeyActive(IH_KEY_CANCEL) || game.inputHandler.isKeyActive(IH_KEY_LEFT))
	{
		game.openMenu(MENU_MAIN);
		game.synth.playSound(SOUND_MENU);
	}
	
	game.inputHandler.clearKeys();
	// game.inputHandler.clearReleasedKeys();
}

ScreenMenu.prototype.draw = function(game)
{
	var t, i;
	
	function lerp(a, b, t)
	{
		return Math.floor(a + (b - a) * t);
	}
	
	function stat(index, t)
	{
		return lerp(game.serverStatsPrevious[index], game.serverStatsLatest[index], t);
	}
	
	game.drawHeader();
	game.drawSmallText(8, 40, "TOTAL TIME PLAYED");
	game.drawBigText(40, 50, game.pad(game.timePad(game.statGetLocalStorageValue(STAT_FRAMES) * 1/12), 10, ' '));
	game.drawSmallText(8, 80, "TOTAL MOVES");
	game.drawBigText(40, 90, game.pad(game.thousandPad(game.statGetLocalStorageValue(STAT_MOVES)), 10, ' '));
	game.drawSmallText(8, 120, "TOTAL PULLS");
	game.drawBigText(40, 130, game.pad(game.thousandPad(game.statGetLocalStorageValue(STAT_PULLS)), 10, ' '));
	
	if (game.serverStatsTime != 0)
	{
		t = ((new Date()).getTime() - game.serverStatsTime) / 60000;
		
		game.drawSmallText(8, 190,
			"GLOBAL STATISTICS\n" +
			" TIME PLAYED" + game.pad(game.timePad(stat(0, t) * 1/12), 12, ' ') + "\n" +
			" MOVES      " + game.pad(game.thousandPad(stat(1, t)), 12, ' ') + "\n" +
			" PULLS      " + game.pad(game.thousandPad(stat(2, t)), 12, ' ') + "\n" +
			" PLAYERS SEEN" + game.pad(game.thousandPad(stat(3, t)), 11, ' ') + "\n" +
			" LEVELS STARTED" + game.pad(game.thousandPad(stat(4, t)),  9, ' ') + "\n" +
			" LEVELS FINISHED" + game.pad(game.thousandPad(stat(5, t)), 8, ' '));
	}
	
	game.ctx.fillStyle = "#474747";
	
	game.ctx.fillRect(230, 40, 172, 210);
	game.drawImageAdvanced(game._asset, game.ctx, 376, 22, 10, 8, 300, 50, 10 * 4, 8 * 4, 0, 0, game.player.colors);
	game.drawBigText(240, 100, game.player.name);
	
	for (i=0; i<game.currentMenu.items.length; i++)
	{
		game.drawSmallText(240, 150 + i * 20, (game.currentMenu.selection == i ? "> " : "  ") + game.currentMenu.items[i][0]);
	}
	
	game.drawSmallText(0, 270, "WWW.BOKOSAN.NET             GITHUB.COM/GHEJA/BOKOSAN");
}
