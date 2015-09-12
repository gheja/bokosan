"use strict";

/**
 * @constructor
 * @extends {ScreenLevels}
 */
var ScreenChallenges = function()
{
}

ScreenChallenges.prototype = new ScreenLevels();

ScreenChallenges.prototype.init = function(game)
{
	var i, j, ok, a;
	
	this.min = 1;
	this.max = 6;
	this.unlockedCount = 0;
	
	if (!game.isOffline)
	{
		for (i=0; i<game.challenges.length; i++)
		{
			ok = true;
			for (j=0; j<game.challenges[i].length; j++)
			{
				// check if level was solved earlier
				a = game.getScores(game.challenges[i][j]);
				
				if (!a[1][0])
				{
					ok = false;
				}
			}
			
			if (ok)
			{
				// NOTE: unlocking must be done in order!
				this.unlockedCount = i + 1;
			}
		}
	}
}

ScreenChallenges.prototype.go = function(game)
{
	game.gameMode = GAME_MODE_CHALLENGE;
	game.currentChallengeId = this.selection - 1;
	game.currentChallenge = game.challenges[game.currentChallengeId];
	game.currentChallengeLevelIndex = 0;
	game.currentChallengeMoves = 0;
	game.nextLevelIndex = game.currentChallenge[0];
	game.screenFadeAndSwitch(SCREEN_GAME);
}

ScreenChallenges.prototype.drawSelectionBox = function()
{
	game.ctx.fillStyle = '#000';
	game.ctx.fillRect((((this.selection - 1) % 6) % 2) * 110 + 16, Math.floor(((this.selection - 1) % 6) / 2) * 80 + 46, 96, 72);
}

ScreenChallenges.prototype.drawPreview = function(game, j, p1, p2)
{
	var s, i;
	
	s = "";
	
	for (i=0; i<game.challenges[j - 1].length; i++)
	{
		s += "LEVEL 1-" + game.pad(game.challenges[j - 1][i] + 1, 2, '0') + "\n";
	}
	
	game.drawSmallText(p1 + 4, p2 + 4, s);
}

ScreenChallenges.prototype.drawStats = function()
{
	var a, s, i;
	
	// game.drawBigText(232, 35, "CHALLENGE " + game.pad(this.selection, 2, '0'));
	game.drawBigText(232, 35, "CHALLENGE " + this.selection);
	
	if (game.isOffline)
	{
		game.drawSmallText(232, 65, "CHALLENGE MODE IS NOT\nAVAILABLE WHEN PLAYING\nLOCALLY OR NO SERVER\nIS RUNNING.\n\nPLEASE GO TO\n      PLAY.BOKOSAN.NET");
		return;
	}
	
	if (this.selection > this.unlockedCount)
	{
		game.drawSmallText(232, 65, "COMPLETE MORE LEVELS\nIN SINGLE PLAYER MODE\nTO UNLOCK");
		return;
	}
	
	s = "";
	s += "a xSANYIKA123    4,432\n";
	s += "b xLEKAN         4,518\n";
	s += "c xKIAIJOW       4,771\n";
	s += "c xASAWWWAA      4,771\n";
	s += "  xVMSJJRSOL     4,833\n";
	s += "  xNAKG KA KO    5,701\n";
	s += "  xQUII         11,379\n";
	s += "  xJAJAJ        13,832\n";
	s += "  xIYIG         18,841\n";
	s += "  xKBXVA        19,166\n";
	s += "  xQUII         23,371\n";
	s += "  xJAJAJ        24,822\n";
	s += "  xQUII         28,124\n";
	s += "  xJAJAJ        44,785\n";
	s += "  xQUII         45,877\n";
	s += "  xJAJAJ        45,966\n";
	s += "  xQUII         49,169\n";
	s += "  xJAJAJ        51,353\n";
	s += "  xIYIG         52,845\n";
	s += "  xKBXVA        54,464\n";
	
	game.drawSmallText(232, 65, s);
}
