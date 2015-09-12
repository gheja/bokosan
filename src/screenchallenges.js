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
	var x, y, l, padX, padY, a, b, color;
	
	game.drawSmallText(p1 + 4, p2 + 4, "LEVEL 1-09\nLEVEL 1-10\nLEVEL 1-11\nLEVEL 1-12");
}

ScreenChallenges.prototype.drawStats = function()
{
	var a, s, i;
	
	game.drawBigText(232, 35, "CHALLENGE " + game.pad(this.selection, 2, '0'));
}

ScreenChallenges.prototype.init = function(game)
{
	// this.max = game.levels.length;
	this.max = 6;
	this.unlockedCount = 2;
}
