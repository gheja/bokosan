"use strict";

/**
 * @constructor
 * @extends {ScreenLevels}
 */
var ScreenChallenges = function() { }

ScreenChallenges.prototype = new ScreenLevels();

ScreenChallenges.prototype.init = function(game)
{
	var i, j, ok, a;
	
	this.min = 1;
	this.max = game.challenges.length;
	this.unlockedCount = 0;
	
	if (!game.isOffline)
	{
		for (i=0; i<game.challenges.length; i++)
		{
			ok = 1;
			for (j=0; j<game.challenges[i].length; j++)
			{
				// check if level was solved earlier
				a = game.getScores(game.challenges[i][j]);
				
				if (!a[1][0])
				{
					ok = 0;
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

ScreenChallenges.prototype.drawPreview = function(game, j, p1, p2)
{
	var s, i;
	
	s = "";
	
	for (i=0; i<game.challenges[j - 1].length; i++)
	{
		s += "LEVEL 1-" + _pad(game.challenges[j - 1][i] + 1, 2, '0') + "\n";
	}
	
	game.drawSmallText(p1 + 4, p2 + 4, s);
}

ScreenChallenges.prototype.drawStats = function(game)
{
	var a, i;
	
	game.drawBigText(232, 35, "CHALLENGE " + this.selection);
	
	if (game.isOffline)
	{
		// game.drawSmallText(232, 65, "CHALLENGE MODE IS NOT\nAVAILABLE WHEN PLAYING\nLOCALLY OR NO SERVER\nIS RUNNING.\n\nPLEASE GO TO\n      PLAY.BOKOSAN.NET");
		game.drawSmallText(232, 65, "NO CONNECTION");
		return;
	}
	
	if (this.selection > this.unlockedCount)
	{
		game.drawSmallText(232, 65, "COMPLETE MORE LEVELS\nIN SINGLE PLAYER MODE");
		return;
	}
	
	a = game.challengeScores[this.selection - 1];
	for (i=0; i<a.length; i++)
	{
		// [challenge id] => [ challenge id, moves, player uid, player name, colors[3][3] ]
		game.drawImageAdvanced(107, 38, 10, 9, 292, 65 + i * 10, 10, 9, 0, 0, a[i][4]);
		game.drawSmallText(232, 65 + i*10, _pad(a[i][1], 7, ' ') + '  ' + a[i][3]);
	}
}
