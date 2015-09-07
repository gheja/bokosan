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
	var i;
	
	game.drawBigText(0, 0, "BOKOSAN");
	game.drawSmallText(0, 20, "FOR JS13KGAMES 2015");
	
	game.drawSmallText(8, 40, "TOTAL TIME PLAYED");
	game.drawBigText(40, 50, game.pad(game.timePad(game.statGetLocalStorageValue(STAT_FRAMES) * 1/12), 10, ' '));
	game.drawSmallText(8, 80, "TOTAL MOVES");
	game.drawBigText(40, 90, game.pad(game.thousandPad(game.statGetLocalStorageValue(STAT_MOVES)), 10, ' '));
	game.drawSmallText(8, 120, "TOTAL PULLS");
	game.drawBigText(40, 130, game.pad(game.thousandPad(game.statGetLocalStorageValue(STAT_PULLS)), 10, ' '));
	
	game.drawSmallText(8, 190,
		"GLOBAL STATISTICS\n" +
		" TIME PLAYED    12:34:56\n" +
		" MOVES         1,212,323\n" +
		" PULLS            78,117\n" +
		" PLAYERS           1,312\n" +
		" LEVELS STARTED  134,111\n" +
		" LEVELS FINISHED  27,178");
	
	game.ctx.fillStyle = "#474747";
	
	// game.ctx.fillRect(220, 140, 172, 110);
	// game.drawImageAdvanced(game._asset, game.ctx, 376, 22, 10, 8, 290, 40, 10 * 4, 8 * 4, 0, 0, game.player.colors);
	// game.drawBigText(230, 90, game.player.name);
	
	game.ctx.fillRect(230, 40, 172, 210);
	game.drawImageAdvanced(game._asset, game.ctx, 376, 22, 10, 8, 300, 50, 10 * 4, 8 * 4, 0, 0, game.player.colors);
	game.drawBigText(240, 100, game.player.name);
	
	for (i=0; i<game.currentMenu.items.length; i++)
	{
		game.drawSmallText(240, 150 + i * 20, (game.currentMenu.selection == i ? "> " : "  ") + game.currentMenu.items[i][0]);
	}
	
	game.drawSmallText(0, 270, "WWW.BOKOSAN.NET             GITHUB.COM/GHEJA/BOKOSAN");
	// game.drawSmallText(300, 260, "WWW.BOKOSAN.NET");
	// game.drawSmallText(228, 270, "GITHUB.COM/GHEJA/BOKOSAN");
}
