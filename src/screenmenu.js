"use strict";

/**
 * @constructor
 * @extends {Screen}
 */
var ScreenMenu = function() { }

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
		game.synth.playSound(SOUND_MENU);
	}
	else if (game.inputHandler.isKeyActive(IH_KEY_DOWN))
	{
		game.currentMenu.step(1);
		game.synth.playSound(SOUND_MENU);
	}
	else if (game.inputHandler.isKeyActive(IH_KEY_ACTION))
	{
		game.currentMenu.go();
		game.synth.playSound(SOUND_MENU);
	}
	else if (game.inputHandler.isKeyActive(IH_KEY_CANCEL))
	{
		game.openMenu(MENU_MAIN);
	}
	
	game.inputHandler.clearKeys();
}

ScreenMenu.prototype.draw = function(game)
{
	var t, i;
	
	function lerp(a, b, t)
	{
		return ~~(a + (b - a) * t);
	}
	
	function stat(index, t)
	{
		return lerp(game.serverStatsPrevious[index], game.serverStatsLatest[index], t);
	}
	
	game.drawHeader();
	game.drawSmallText(8, 40,
		"TOTAL TIME PLAYED\n\n\n\n" +
		"TOTAL MOVES\n\n\n\n" +
		"TOTAL PULLS"
	);
	game.drawBigText(40, 50,
		_pad(_timePad(game.statGetValue(STAT_FRAMES) * 1/12), 10, ' ') + "\n\n" +
		_pad(_thousandPad(game.statGetValue(STAT_MOVES)), 10, ' ') + "\n\n" +
		_pad(_thousandPad(game.statGetValue(STAT_PULLS)), 10, ' ')
	);
	
	
	if (!game.isOffline)
	{
		t = ((new Date()).getTime() - game.serverStatsTime) / 60000;
		
		game.drawSmallText(8, 190,
			"GLOBAL STATISTICS\n" +
			" TIME PLAYED" + _pad(_timePad(stat(0, t) * 1/12), 12, ' ') + "\n" +
			" MOVES      " + _pad(_thousandPad(stat(1, t)), 12, ' ') + "\n" +
			" PULLS      " + _pad(_thousandPad(stat(2, t)), 12, ' ') + "\n" +
			" PLAYERS SEEN" + _pad(_thousandPad(stat(3, t)), 11, ' ') + "\n" +
			" LEVELS STARTED" + _pad(_thousandPad(stat(4, t)),  9, ' ') + "\n" +
			" LEVELS FINISHED" + _pad(_thousandPad(stat(5, t)), 8, ' '));
	}
	
	game.c.fillStyle = "#474747";
	
	game.c.fillRect(230, 40, 176, 210);
	game.drawImageAdvanced(376, 22, 10, 8, 300, 50, 10 * 4, 8 * 4, 0, 0, game.player.colors);
	game.drawBigText(240, 100, game.player.name);
	
	for (i=0; i<game.currentMenu.items.length; i++)
	{
		game.drawSmallText(240, 150 + i * 20, (game.currentMenu.selection == i ? "> " : "  ") + game.currentMenu.items[i][0]);
	}
	
	game.drawSmallText(292, 270, "WWW.BOKOSAN.NET");
}
