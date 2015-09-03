"use strict";

/**
 * @constructor
 * @extends {Screen}
 * @param {Game} game
 */
var ScreenLevel = function()
{
}

ScreenLevel.prototype = new Screen2();

ScreenLevel.prototype.init = function(game)
{
}

ScreenLevel.prototype.tick = function(game)
{
	var i;
	
	if (game.isLevelFinished())
	{
		// congratulate the user, update highscores, etc.
		// yes, the player can win even if stuck
		game.statIncrease(STAT_LEVELS_FINISHED);
		game.screenFadeAndSwitch(SCREEN_MENU);
	}
	else if (game.player.isStuck())
	{
		// show a dialog about this unfortunate incident...
		game.screenFadeAndSwitch(SCREEN_MENU);
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
			// pause
			game.screenFadeAndSwitch(SCREEN_MENU);
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
		game.objects[i].updateRenderOrder();
		game.objects[i].setRenderNeeded(true);
	}
	
	for (y=0; y<game.currentLevelHeight; y++)
	{
		for (x=0; x<game.currentLevelWidth; x++)
		{
			c = game.currentLevel[y * game.currentLevelWidth + x];
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
			}
			
			
			a1 = (x - 1) * 20;
			b1 = (y - 1) * 18;
			a2 = x * 20;
			b2 = y * 18;
			
			for (i=0; i<game.objects.length; i++)
			{
				if (game.objects[i].getRenderNeeded())
				{
					p = game.objects[i].getPosition();
					if (p[0] > a1 && p[0] <= a2 && p[1] > b1 && p[1] <= b2)
					{
						game.objects[i].draw();
					}
				}
			}
		}
	}
	
	game.drawSmallText(0, 270, "TIME " + game.timePad(game.currentStats[STAT_FRAMES] * 1/12) + "   MOVES " + game.pad(game.currentStats[STAT_MOVES], 5, '0') + "   PULLS " + game.pad(game.currentStats[STAT_PULLS], 5, '0') + "  LEVEL 1-50");
}



