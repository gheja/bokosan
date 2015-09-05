"use strict";

/**
 * @constructor
 * @extends {Screen}
 */
var ScreenLevels = function()
{
	this.selection = 1;
	this.min = 1;
	this.max = 1;
}

ScreenLevels.prototype = new Screen2();

ScreenLevels.prototype.go = function(game)
{
	game.loadLevel(this.selection - 1);
	game.screenFadeAndSwitch(SCREEN_GAME);
}

ScreenLevels.prototype.drawSelectionBox = function()
{
	game.ctx.fillStyle = '#000';
	game.ctx.fillRect(((this.selection - 1) % 2) * 110 + 16, Math.floor((this.selection - 1) / 2) * 80 + 46, 96, 72);
	
}

ScreenLevels.prototype.drawSelectionOptions = function()
{
	var i, j, l, c, x, y, color, a, b, p1, p2, padX, padY;
	
	// draw level previews
	for (i=this.min; i<=this.max; i++)
	{
		p1 = ((i - 1) % 2) * 110 + 20;
		p2 = Math.floor((i - 1) / 2) * 80 + 50;
		
		game.ctx.fillStyle = "#444";
		game.ctx.fillRect(p1, p2, 88, 64);
		
		l = game.levels[i - 1];
		
		padX = Math.floor((22 - l[LEVEL_DATA_WIDTH]) / 2);
		padY = Math.floor((15- l[LEVEL_DATA_HEIGHT]) / 2);
		
		for (y=0; y<l[LEVEL_DATA_HEIGHT]; y++)
		{
			for (x=0; x<l[LEVEL_DATA_WIDTH]; x++)
			{
				a = p1 + (x + padX) * 4;
				b = p2 + (y + padY) * 4;
				
				switch (l[LEVEL_DATA_TILES][y * l[LEVEL_DATA_WIDTH] + x])
				{
					case "w": // wall
						color = "#b42";
						break;
					
					case "/": // keep-clear floor
						color = "#a86";
					break;
					
					case "B":
						color = "#eee";
					break;
					
					case ".":
					case "P":
						color = "#333";
					break;
					
					case "a":
					case "b":
					case "c":
					case "d":
					case "e":
						color = "#000";
					break;
					
					default:
						continue;
					break;
				}
				
				game.ctx.fillStyle = color;
				game.ctx.fillRect(a, b, 4, 4);
			}
		}
	}
}

ScreenLevels.prototype.drawStats = function()
{
	// stats
	game.drawBigText(240, 35, "LEVEL 01");
	game.drawSmallText(240, 65, "BEST TIMES:\n 0:03:01\n 0:03:12\n 0:01:23\n\nBEST MOVES:\n 121 A+\n 122 A+\n 190\n\nBEST PULLS:\n 27\n 29\n 43");
}

ScreenLevels.prototype.init = function(game)
{
	this.max = game.levels.length;
}

ScreenLevels.prototype.tick = function(game)
{
	var lastSelection;
	
	lastSelection = this.selection;
	
	if (game.inputHandler.isKeyActive(IH_KEY_UP))
	{
		this.selection -= 2;
	}
	else if (game.inputHandler.isKeyActive(IH_KEY_RIGHT))
	{
		this.selection++;
	}
	else if (game.inputHandler.isKeyActive(IH_KEY_DOWN))
	{
		this.selection += 2;
	}
	else if (game.inputHandler.isKeyActive(IH_KEY_LEFT))
	{
		this.selection--;
	}
	else if (game.inputHandler.isKeyActive(IH_KEY_ACTION))
	{
		this.go(game);
		game.playSound(SOUND_NEXT);
	}
	else if (game.inputHandler.isKeyActive(IH_KEY_CANCEL))
	{
		game.screenFadeAndSwitch(SCREEN_MENU);
	}
	
	this.selection = Math.min(Math.max(this.min, this.selection), this.max);
	
	if (lastSelection != this.selection)
	{
		game.playSound(SOUND_MENU);
	}
	
	game.inputHandler.clearKeys();
}

ScreenLevels.prototype.draw = function(game)
{
	game.drawBigText(0, 0, "BOKOSAN");
	game.drawSmallText(0, 20, "FOR JS13KGAMES 2015");
	
	this.drawSelectionBox();
	this.drawSelectionOptions();
	this.drawStats();
}
