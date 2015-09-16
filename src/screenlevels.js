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
	this.unlockedCount = 1;
}

ScreenLevels.prototype = new Screen2();

ScreenLevels.prototype.go = function(game)
{
	game.gameMode = GAME_MODE_LOCAL;
	game.nextLevelIndex = this.selection - 1;
	game.screenFadeAndSwitch(SCREEN_GAME);
}

ScreenLevels.prototype.drawSelectionBox = function()
{
	game.ctx.fillStyle = '#000';
	game.ctx.fillRect((((this.selection - 1) % 6) % 2) * 110 + 16, Math.floor(((this.selection - 1) % 6) / 2) * 76 + 46, 96, 72);
}

ScreenLevels.prototype.drawPreview = function(game, j, p1, p2)
{
	var x, y, l, padX, padY, a, b, color;
	
	l = game.levels[j - 1];
	
	padX = Math.floor((22 - l[LEVEL_DATA_WIDTH]) / 2);
	padY = Math.floor((15 - l[LEVEL_DATA_HEIGHT]) / 2);
	
	for (y=0; y<l[LEVEL_DATA_HEIGHT]; y++)
	{
		for (x=0; x<l[LEVEL_DATA_WIDTH]; x++)
		{
			a = p1 + (x + padX) * 4 + 2;
			b = p2 + (y + padY) * 4 + 2;
			
			switch (l[LEVEL_DATA_TILES][y * l[LEVEL_DATA_WIDTH] + x])
			{
				case "w": // wall
					color = "#b42";
					break;
				
				case "/": // keep-clear floor
					color = "#a86";
				break;
				
				case "B":
				case "E":
					color = "#eee";
				break;
				
				case ".":
				case "P":
					color = "#333";
				break;
				
/*
				case "a":
				case "b":
				case "c":
				case "d":
				case "e":
				case "f":
				case "g":
				case "h":
					color = "#000";
				break;
				
				default:
					continue;
				break;
*/
				case " ":
					continue;
				break;
				
				case "e":
					color = "#222";
				break;
				
				default:
					color = "#000";
				break;
			}
			
			game.ctx.fillStyle = color;
			game.ctx.fillRect(a, b, 4, 4);
		}
	}
}

ScreenLevels.prototype.drawSelectionOptions = function()
{
	var i, j, p1, p2, page, a;
	
	page = Math.floor((this.selection - 1) / 6);
	
	for (i=1; i<=6; i++)
	{
		j = page * 6 + i;
		
		if (j > this.max)
		{
			break;
		}
		
		p1 = ((i - 1) % 2) * 110 + 20;
		p2 = Math.floor((i - 1) / 2) * 76 + 50;
		
		game.ctx.fillStyle = "#444";
		game.ctx.fillRect(p1, p2, 88, 64);
		
		if (this.unlockedCount < j)
		{
			game.drawSmallText(p1 + 20, p2 + 28, "LOCKED");
			continue;
		}
		
		this.drawPreview(game, j, p1, p2);
		
		// no A+ in challenge mode
		if (!(this instanceof ScreenChallenges))
		{
			a = game.getScores(j - 1);
			if (a[1][0])
			{
				if (a[1][0] <= game.levels[j - 1][LEVEL_DATA_APLUS])
				{
					game.ctx.drawImage(game._asset, 83, 38, 12, 9, p1 + 80, p2 - 4, 12, 9);
				}
				else
				{
					game.ctx.drawImage(game._asset, 95, 38, 12, 9, p1 + 80, p2 - 4, 12, 9);
				}
			}
		}
	}
	
	if (page != 0)
	{
		game.drawSmallTextBlinking(115, 35, "u");
	}
	
	if (page != Math.floor((this.max - 1) / 6))
	{
		game.drawSmallTextBlinking(115, 270, "d");
	}
}

ScreenLevels.prototype.drawStats = function()
{
	var a, b, s, i;
	
	// stats
	a = game.getScores(this.selection - 1);
	
	game.drawBigText(240, 35, "LEVEL 1-" + game.pad(this.selection, 2, '0'));
	
	if (this.selection > this.unlockedCount)
	{
		game.drawSmallText(240, 65, "COMPLETE PREVIOUS\nLEVELS TO UNLOCK");
		return;
	}
	
	s = "";
	
	if (a[1][0])
	{
		b = a[1][0] - game.levels[this.selection - 1][LEVEL_DATA_APLUS];
		
		if (b > 0)
		{
			s += "ONLY " + b + " MOVES AWAY\nFROM A+ RANK\n\n";
		}
		else
		{
			s += "RANKED A+\n\n\n";
		}
		
		s += "\n";
		s += "BEST TIMES:\n";
		
		for (i in a[0])
		{
			s += "  " + game.timePad(a[0][i] * 1/12) + "\n";
		}
		s += "\n";
		
		s += "BEST MOVES:\n  " + a[1].join("\n  ") + "\n\n";
		s += "BEST PULLS:\n  " + a[2].join("\n  ");
	}
	else
	{
		s += "YOU HAVE NOT COMPLETED\nTHIS LEVEL YET";
	}
	
	game.drawSmallText(240, 65, s);
}

ScreenLevels.prototype.init = function(game)
{
	var i, a;
	
	this.max = game.levels.length;
	this.unlockedCount = 2;
	this.selection = game.currentLevelIndex + 1;
	for (i=0; i<this.max; i++)
	{
			a = game.getScores(i);
			if (a[1][0])
			{
				this.unlockedCount++;
			}
	}
	game.playMenuMusic();
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
		if (this.selection <= this.unlockedCount)
		{
			this.go(game);
			game.synth.playSound(SOUND_HELLO);
		}
	}
	else if (game.inputHandler.isKeyActive(IH_KEY_CANCEL))
	{
		game.screenFadeAndSwitch(SCREEN_MENU);
	}
	
	this.selection = Math.min(Math.max(this.min, this.selection), this.max);
	
	if (lastSelection != this.selection)
	{
		game.synth.playSound(SOUND_MENU);
	}
	
	game.inputHandler.clearKeys();
}

ScreenLevels.prototype.draw = function(game)
{
	game.drawHeader();
	this.drawSelectionBox();
	this.drawSelectionOptions();
	this.drawStats();
}
