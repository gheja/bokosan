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
	
	game.playMenuMusic();
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
	var a, s, i, j, place;
	
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
	
	j = 0;
	s = "";
	a = game.challengeScores[this.selection - 1];
	place = 1;
	for (i=0; i<a.length; i++)
	{
		// [challenge id] => [ challenge id, moves, player uid, player name, colors[3][3] ]
		
		if (i > 0 && a[i][1] != a[i - 1][1])
		{
			place++;
		}
		
		if (place == 1)
		{
			s += "a";
		}
		else if (place == 2)
		{
			s += "b";
		}
		else if (place == 3)
		{
			s += "c";
		}
		else
		{
			s += " ";
		}
		
		s += "  " + game.rpad(a[i][3], 10, ' ') + game.pad(game.thousandPad(a[i][1]), 9, ' ') + "\n";
		
		game.drawImageAdvanced(game._asset, game.ctx, 107, 38, 10, 9, 244, 65 + i * 10, 10, 9, 0, 0, a[i][4]);
	}
	
	game.drawSmallText(232, 65, s);
}
