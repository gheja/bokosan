"use strict";

/**
 * @constructor
 * @extends {Screen}
 */
var ScreenLevel = function()
{
}

ScreenLevel.prototype = new Screen2();

ScreenLevel.prototype.init = function(game)
{
	// if paused
	if (game.nextLevelIndex !== null)
	{
		game.loadLevel();
	}
}

ScreenLevel.prototype.back = function(game)
{
	if (game.gameMode == GAME_MODE_LOCAL)
	{
		game.screenFadeAndSwitch(SCREEN_LEVELS);
	}
	else
	{
		game.screenFadeAndSwitch(SCREEN_CHALLENGES);
	}
}

ScreenLevel.prototype.tick = function(game)
{
	var i;
	
	if (game.isLevelFinished())
	{
		// congratulate the user, update highscores, etc.
		// yes, the player can win even if stuck
		game.statIncrease(STAT_LEVELS_FINISHED);
		game.saveScores();
		game.statSubmit(1);
		if (game.gameMode == GAME_MODE_LOCAL)
		{
			this.back(game);
		}
		else // GAME_MODE_CHALLENGE
		{
			game.currentChallengeLevelIndex++;
			if (game.currentChallengeLevelIndex < game.currentChallenge.length)
			{
				game.nextLevelIndex = game.currentChallenge[game.currentChallengeLevelIndex];
				game.screenFadeAndSwitch(SCREEN_GAME);
			}
			else
			{
				game.statSubmitChallenge();
				this.back(game);
			}
		}
	}
	else if (game.player.isStuck())
	{
		game.statSubmit(0);
		this.back(game);
	}
	else if (game.player.isInHole())
	{
		if (game.player.status != OBJ_STATUS_FALLING)
		{
			game.nextLevelIndex = game.currentLevelIndex - 1;
			game.synth.playSound(SOUND_FALLING);
			game.player.setStatus(OBJ_STATUS_FALLING);
			game.screenFadeAndSwitch(SCREEN_GAME);
			game.statSubmit(0);
		}
	}
	else if (game.player.isOnSpikes())
	{
		game.synth.playSound(SOUND_SPIKE);
		game.statSubmit(0);
		this.back(game);
	}
	else
	{
		game.statIncrease(STAT_FRAMES);
		
		if (game.inputHandler.isKeyStatus(IH_KEY_ACTION, IH_KEY_STAUTS_RELEASED))
		{
			game.player.tryRelease();
		}
		
		if (game.inputHandler.isKeyStatus(IH_KEY_ACTION, IH_KEY_STAUTS_PRESSED))
		{
			game.player.tryGrab();
		}
		
		if (game.inputHandler.isKeyActive(IH_KEY_CANCEL))
		{
			game.statSubmit(0);
			this.back(game);
		}
		
		if (game.inputHandler.isKeyActive(IH_KEY_UP))
		{
			game.player.tryWalk(OBJ_ORIENTATION_NORTH);
		}
		
		if (game.inputHandler.isKeyActive(IH_KEY_RIGHT))
		{
			game.player.tryWalk(OBJ_ORIENTATION_EAST);
		}
		
		if (game.inputHandler.isKeyActive(IH_KEY_DOWN))
		{
			game.player.tryWalk(OBJ_ORIENTATION_SOUTH);
		}
		
		if (game.inputHandler.isKeyActive(IH_KEY_LEFT))
		{
			game.player.tryWalk(OBJ_ORIENTATION_WEST);
		}
	}
	
	game.inputHandler.clearReleasedKeys();
	
	for (i=0; i<game.objects.length; i++)
	{
		game.objects[i].tick();
	}
}

ScreenLevel.prototype.draw = function(game)
{
	var x, y, a, b, c, width, height, i, a1, b1, a2, b2, p;
	
	for (i=0; i<game.objects.length; i++)
	{
		game.objects[i].renderNeeded = true;
	}
	
	for (y=0; y<game.currentLevel[LEVEL_DATA_HEIGHT]; y++)
	{
		for (x=0; x<game.currentLevel[LEVEL_DATA_WIDTH]; x++)
		{
			c = game.currentLevel[LEVEL_DATA_TILES][y * game.currentLevel[LEVEL_DATA_WIDTH] + x];
			a = x * 20 + game.levelPadX;
			b = y * 18 + game.levelPadY;
			
			switch (c)
			{
				case "w": // wall
					game.drawTile(a, b, 0, 0, 0, 0);
				break;
				
				case ".": // floor
				case "P": // floor (below the player)
					game.drawTile(a, b, 2, 0, 0, 0);
				break;
				
				case "/": // keep-clear floor
				case "B": // keep-clear floor (below the box)
					game.drawTile(a, b, 3, 0, 0, 0);
				break;
				
				case "a": // hole
					game.drawTile(a, b, 4, 0, 0, 0);
				break;
				
				case "b": // hole
					game.drawTile(a, b, 5, 0, 0, 0);
				break;
				
				case "c": // hole
					game.drawTile(a, b, 6, 0, 0, 0);
				break;
				
				case "d": // hole
					game.drawTile(a, b, 7, 0, 0, 0);
				break;
				
				case "e": // spike
				case "E": // spike (below the box)
					if (game.player.x == x * 20 && game.player.y == y * 18)
					{
						// triggered spike
						game.drawTile(a, b, 9, 0, 0, 0);
					}
					else
					{
						// normal spike
						game.drawTile(a, b, 8, 0, 0, 0);
					}
				break;
				
				case "f": // hole
					game.drawTile(a, b, 19, 0, 0, 0);
				break;
				
				case "g": // hole
					game.drawTile(a, b, 20, 0, 0, 0);
				break;
				
				case "h": // hole
					game.drawTile(a, b, 21, 0, 0, 0);
				break;
			}
			
			
			a1 = (x - 1) * 20;
			b1 = (y - 1) * 18;
			a2 = x * 20;
			b2 = y * 18;
			
			for (i=0; i<game.objects.length; i++)
			{
				if (game.objects[i].renderNeeded)
				{
					if (game.objects[i].x > a1 && game.objects[i].x <= a2 && game.objects[i].y > b1 && game.objects[i].y  <= b2)
					{
						game.objects[i].draw();
					}
				}
			}
		}
	}
	
	if (game.gameMode == GAME_MODE_CHALLENGE)
	{
		game.drawSmallText(0, 0, "CHALLENGE MODE   MOVES " + game.pad(game.currentChallengeMoves, 5, '0') + "            LEVEL " + (game.currentChallengeLevelIndex + 1) + " OF " + (game.currentChallenge.length));
	}
	game.drawSmallText(0, 270, "TIME " + game.timePad(game.currentStats[STAT_FRAMES] * 1/12) + "   MOVES " + game.pad(game.currentStats[STAT_MOVES], 5, '0') + "   PULLS " + game.pad(game.currentStats[STAT_PULLS], 5, '0') + "  LEVEL 1-" + game.pad(game.currentLevelIndex + 1, 2, '0'));
}
