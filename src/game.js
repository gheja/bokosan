"use strict";

/**
 * @constructor
 */
var Game = function()
{
	this.realCanvas = null;
	this.realCtx = null;
	this.pixelRatio = 1;
	this.zoomLevel = 1;
	this.canvas = null;
	this.ctx = null;
	this._asset = null;
	this._assetLoaded = false;
	this.ready = false;
	this.ticks = 0;
	this.waitingForKeypress = false;
	/** @type {Menu} */ this.currentMenu = null;
	/** @type {Menu} */ this.mainMenu = new Menu(0, [
		[ "PLAY", this.screenFadeAndSwitch.bind(this, SCREEN_GAME) ],
		[ "CUSTOMIZE", this.screenFadeAndSwitch.bind(this, SCREEN_MENU) ],
		[ "HOW TO PLAY", this.screenFadeAndSwitch.bind(this, SCREEN_MENU) ]
	]);
	
	/** @type {Array<Obj>} */ this.objects = [];
	/** @type {PlayerObj} */ this.player = null;
	
	/** @type {Array} */ this.levels = [
		// 0
		[
			0, 0,
			""
		],
		// 1
		[
			// width, height, level data
			9, 7,
			"   wwwww " +
			"wwww.P.w " +
			"wBB/...ww" +
			"wBB/....w" +
			"wwww...ww" +
			"   w...w " +
			"   wwwww "
		]
		// 2
	];
	
	
	this.currentScreen = SCREEN_INTRO;
	this.currentScreenTicks = 0;
	
	this.currentLevel = "";
	
	this.fadeMode = FADE_MODE_NONE;
	this.fadePercent = 0; // 0: faded/black ... 100: clear/game screen
	this.validTextCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,:!?()x<>udr@/-_+*=\"'";
}

	// thx David @ http://stackoverflow.com/a/15439809
Game.prototype.isTouchAvailable = function()
{
	if (('ontouchstart' in window) || (navigator.msMaxTouchPoints > 0))
	{
		return true;
	}
	
	return false;
}

Game.prototype.drawImageAdvanced = function(sctx, dctx, sx, sy, sw, sh, dx, dy, dw, dh, rotated, mirrored)
{
	dctx.save();
	dctx.translate(dx, dy);
	dctx.translate(dw / 2, dh / 2);
	if (rotated)
	{
		dctx.rotate(- Math.PI / 2);
	}
	if (mirrored)
	{
		dctx.scale(-1, 1);
	}
	dctx.drawImage(sctx, sx, sy, sw, sh, - dw / 2, - dh / 2, dw, dh);
	dctx.restore();
}

Game.prototype.drawText = function(posX, posY, content, blinking, width, height, scale)
{
	var i, x, y, index;
	
	if (blinking && Math.floor(this.currentScreenTicks / 6) % 2 == 0)
	{
		return;
	}
	
	x = 0;
	y = 0;
	for (i=0; i<content.length; i++)
	{
		if (content[i] == "\n")
		{
			x = 0;
			y++;
			continue;
		}
		
		index = this.validTextCharacters.indexOf(content[i]);
		
		if (index == -1)
		{
			continue;
		}
		
		this.ctx.drawImage(this._asset, index * 7, 0, 7, 10, posX + x * 8 * scale, posY + y * 10 * scale, 7 * scale, 10 * scale);
		
		x++;
		
		if (x > width)
		{
			x = 0;
			y++;
		}
	}
}

Game.prototype.drawSmallText = function(posX, posY, content)
{
	this.drawText(posX, posY, content, false, 1000, 1000, 1);
}

Game.prototype.drawSmallTextBlinking = function(posX, posY, content)
{
	this.drawText(posX, posY, content, true, 1000, 1000, 1);
}

Game.prototype.drawBigText = function(posX, posY, content)
{
	this.drawText(posX, posY, content, false, 1000, 1000, 2);
}

Game.prototype.drawTile = function(posX, posY, tileNumber, rotated, mirrored, floorOnly)
{
	if (!floorOnly)
	{
		// this.drawImageAdvanced(this._asset, c, tileNumber * 28, 11, 27, 25, posX, posY, 27, 25, rotated, mirrored);
		this.ctx.drawImage(this._asset, tileNumber * 28, 11, 27, 25, posX, posY, 27, 25);
	}
	else
	{
		this.drawImageAdvanced(this._asset, this.ctx, tileNumber * 28 + 7, 11 + 7, 20, 18, posX + 7, posY + 7, 20, 18, rotated, mirrored);
	}
}

Game.prototype.onResize = function()
{
	var scale, w, h, tmp;
	
	tmp = this.zoomLevel;
	
	this.zoomLevel = Math.max(Math.min(Math.floor(window.innerWidth / WIDTH), Math.floor(window.innerHeight / HEIGHT)), 0.5);
	
	
	if (this.zoomLevel * this.pixelRatio < 1)
	{
		this.zoomLevel = 1;
		
		// warn the user about viewport clipping
	}
	
/*
	if (this.zoomLevel < 2 && window.innerWidth < window.innerHeight)
	{
		// suggest the use of landscape mode
	}
*/
	
	w = WIDTH * this.zoomLevel;
	h = HEIGHT * this.zoomLevel;
	
	// this check does not work on mobile. what.
	// if (tmp != this.zoomLevel)
	{
		// I just _really_ love the hiDPI display hacks...
		this.realCanvas.width = w * this.pixelRatio;
		this.realCanvas.height = h * this.pixelRatio;
		
		// these are reset to true on resize
		this.realCtx.imageSmoothingEnabled = false;
		this.realCtx.mozImageSmoothingEnabled = false;
		this.realCtx.webkitImageSmoothingEnabled = false;
		this.realCtx.msImageSmoothingEnabled = false;
		
		this.realCanvas.style.width = w;
		this.realCanvas.style.height = h;
	}
	
	this.realCanvas.style.left = (window.innerWidth - w) / 2;
	this.realCanvas.style.top = (window.innerHeight - h) / 2;
	
}

Game.prototype.loadLevel = function(index)
{
	this.currentLevelWidth = this.levels[index][0];
	this.currentLevelHeight = this.levels[index][1];
	this.currentLevel = this.levels[index][2];
}

Game.prototype.isLevelFinished = function()
{
	var i;
	
	if (this.player.moveStepLeft != 0)
	{
		return false;
	}
	
	for (i in this.objects)
	{
		if (this.objects[i].isBox && this.objects[i].getNeighbourTile(0, 0) != '.')
		{
			return false;
		}
	}
	
	return true;
}

Game.prototype.screenFadeAndSwitch = function(_new_screen)
{
	this.nextScreen = _new_screen;
	this.fadeMode = FADE_MODE_OUT;
}

Game.prototype.switchScreen = function(_new_screen)
{
	var x, y, a, b;
	
	this.currentScreen = _new_screen;
	this.currentScreenTicks = 0;
	
	// initialization of the new screen
	switch (_new_screen)
	{
		case SCREEN_INTRO:
		break;
		
		case SCREEN_MENU:
			this.currentMenu = this.mainMenu;
		break;
		
		case SCREEN_GAME:
			this.loadLevel(1);
			
			this.objects.length = 0;
			this.player = null;
			
			for (y=0; y<this.currentLevelHeight; y++)
			{
				for (x=0; x<this.currentLevelWidth; x++)
				{
					a = x * 20;
					b = y * 18;
					
					switch (this.currentLevel[y * this.currentLevelWidth + x])
					{
						case "P": // the player
							this.player = new PlayerObj(this, a, b);
							this.objects.push(this.player);
						break;
						
						case "B": // a box
							this.objects.push(new BoxObj(this, a, b));
						break;
					}
				}
			}
		break;
	}
	
	// clear all inputs captured during fade
	this.inputHandler.clearKeys();
}

Game.prototype.fadeTick = function()
{
	if (this.fadeMode == FADE_MODE_NONE)
	{
		return;
	}
	
	if (this.fadeMode == FADE_MODE_OUT && this.fadePercent == 0)
	{
		this.switchScreen(this.nextScreen);
		this.fadeMode = FADE_MODE_IN;
	}
	
	if (this.fadeMode == FADE_MODE_IN)
	{
		this.fadePercent += 34;
	}
	else if (this.fadeMode == FADE_MODE_OUT)
	{
		this.fadePercent -= 34;
	}
	
	this.fadePercent = Math.min(Math.max(this.fadePercent, 0), 100);
	
	if (this.fadePercent == 100)
	{
		this.fadeMode = FADE_MODE_NONE;
	}
}

Game.prototype.fadeApply = function(ctx, percent)
{
	ctx.fillStyle = "rgba(85, 85, 85, " + (1 - percent / 100) + ")";
	ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
}

Game.prototype.screenDraw = function()
{
	var x, y, a, b, c, width, height, i, a1, b1, a2, b2, p;
	
	switch (this.currentScreen)
	{
		case SCREEN_INTRO:
			this.drawBigText(146, 80, "BOKOSAN");
			this.drawSmallText(122, 100, "FOR JS13KGAMES 2015\n\n  WWW.BOKOSAN.NET");
			if (!this.ready)
			{
				this.drawSmallText(168, 200, "LOADING");
			}
			else
			{
				if (this.isTouchAvailable())
				{
					this.drawSmallTextBlinking(96, 200, "TOUCH ANYWHERE TO CONTINUE");
				}
				else
				{
					this.drawSmallTextBlinking(104, 200, "PRESS A KEY TO CONTINUE");
				}
			}
		break;
		
		case SCREEN_MENU:
			this.drawBigText(0, 0, "BOKOSAN");
			this.drawSmallText(0, 20, "FOR JS13KGAMES 2015");
			
			this.drawSmallText(0, 50, "TOTAL TIME PLAYED");
			this.drawBigText(0, 60, "  131:54:22");
			this.drawSmallText(0, 90, "TOTAL MOVES");
			this.drawBigText(0, 100, "  9,612,334");
			this.drawSmallText(0, 130, "TOTAL PULLS");
			this.drawBigText(0, 140, "     84,414");
			
			for (i=0; i<this.currentMenu.items.length; i++)
			{
				this.drawSmallText(200, 50 + i * 20, (this.currentMenu.selection == i ? "> " : "  ") + this.currentMenu.items[i][0]);
			}
			
			this.drawSmallText(0, 270, "GITHUB.COM/GHEJA/BOKOSAN - WWW.BOKOSAN.NET");
		break;
		
		case SCREEN_GAME:
			for (i=0; i<this.objects.length; i++)
			{
				this.objects[i].updateRenderOrder();
				this.objects[i].setRenderNeeded(true);
			}
			
			for (y=0; y<this.currentLevelHeight; y++)
			{
				for (x=0; x<this.currentLevelWidth; x++)
				{
					c = this.currentLevel[y * this.currentLevelWidth + x];
					a = x * 20;
					b = y * 18;
					
					switch (c)
					{
						case "w": // wall
							this.drawTile(a, b, 0, 0, 0, 0);
						break;
						
						case ".": // floor
						case "P": // floor (below the player)
							this.drawTile(a, b, 2, 0, 0, 0);
						break;
						
						case "/": // keep-clear floor
						case "B": // keep-clear floor (below the box)
							this.drawTile(a, b, 3, 0, 0, 0);
						break;
					}
					
					
					a1 = (x - 1) * 20;
					b1 = (y - 1) * 18;
					a2 = x * 20;
					b2 = y * 18;
					
					for (i=0; i<this.objects.length; i++)
					{
						if (this.objects[i].getRenderNeeded())
						{
							p = this.objects[i].getPosition();
							if (p[0] > a1 && p[0] <= a2 && p[1] > b1 && p[1] <= b2)
							{
								this.objects[i].draw();
							}
						}
					}
				}
			}
		break;
	}
}

Game.prototype.screenTick = function()
{
	var i;
	
	this.ticks++;
	this.currentScreenTicks++;
	
	if (this.waitingForKeypress)
	{
		if (this.inputHandler.checkIfKeyPressedAndClear())
		{
			this.fadeMode = FADE_MODE_OUT;
			this.waitingForKeypress = false;
		}
	}
	
	if (this.currentScreen == SCREEN_INTRO)
	{
	}
	else if (this.currentScreen == SCREEN_MENU)
	{
		if (!this.inputHandler.isKeyStatus(IH_KEY_UP, IH_KEY_STAUTS_RESET))
		{
			this.currentMenu.step(-1);
		}
		else if (!this.inputHandler.isKeyStatus(IH_KEY_DOWN, IH_KEY_STAUTS_RESET))
		{
			this.currentMenu.step(1);
		}
		else if (!this.inputHandler.isKeyStatus(IH_KEY_ACTION, IH_KEY_STAUTS_RESET) || !this.inputHandler.isKeyStatus(IH_KEY_RIGHT, IH_KEY_STAUTS_RESET))
		{
			this.currentMenu.go();
		}
		
		this.inputHandler.clearKeys();
		// this.inputHandler.clearReleasedKeys();
	}
	else if (this.currentScreen == SCREEN_GAME)
	{
		if (this.isLevelFinished())
		{
			// congratulate the user, update highscores, etc.
			// yes, the player can win even if stuck
			this.screenFadeAndSwitch(SCREEN_MENU);
		}
		else if (this.player.isStuck())
		{
			// show a dialog about this unfortunate incident...
			this.screenFadeAndSwitch(SCREEN_MENU);
		}
		else
		{
			if (this.inputHandler.isKeyStatus(IH_KEY_ACTION, IH_KEY_STAUTS_RELEASED))
			{
				this.player.tryRelease();
			}
			
			if (this.inputHandler.isKeyStatus(IH_KEY_ACTION, IH_KEY_STAUTS_PRESSED))
			{
				this.player.tryGrab();
			}
			
			if (!this.inputHandler.isKeyStatus(IH_KEY_CANCEL, IH_KEY_STAUTS_RESET))
			{
				// pause
				this.screenFadeAndSwitch(SCREEN_MENU);
			}
			
			if (!this.inputHandler.isKeyStatus(IH_KEY_UP, IH_KEY_STAUTS_RESET))
			{
				this.player.tryWalk(OBJ_ORIENTATION_NORTH);
			}
			
			if (!this.inputHandler.isKeyStatus(IH_KEY_RIGHT, IH_KEY_STAUTS_RESET))
			{
				this.player.tryWalk(OBJ_ORIENTATION_EAST);
			}
			
			if (!this.inputHandler.isKeyStatus(IH_KEY_DOWN, IH_KEY_STAUTS_RESET))
			{
				this.player.tryWalk(OBJ_ORIENTATION_SOUTH);
			}
			
			if (!this.inputHandler.isKeyStatus(IH_KEY_LEFT, IH_KEY_STAUTS_RESET))
			{
				this.player.tryWalk(OBJ_ORIENTATION_WEST);
			}
		}
		
		this.inputHandler.clearReleasedKeys();
	}
	
	for (i=0; i<this.objects.length; i++)
	{
		this.objects[i].tick();
	}
}

Game.prototype.redraw = function()
{
	if (!this._assetLoaded)
	{
		return;
	}
	
	this.fadeTick();
	
	if (this.fadeMode == FADE_MODE_NONE)
	{
		this.screenTick();
	}
	
	this.ctx.fillStyle = "#555";
	this.ctx.fillRect(0, 0, WIDTH, HEIGHT);
	
	this.screenDraw();
	
	this.fadeApply(this.ctx, this.fadePercent);
	
	this.realCtx.drawImage(this.canvas, 0, 0, WIDTH, HEIGHT, 0, 0, WIDTH * this.pixelRatio * this.zoomLevel, HEIGHT * this.pixelRatio * this.zoomLevel);
}

Game.prototype.loadFinished = function()
{
	this.ready = true;
	this.waitingForKeypress = true;
	this.nextScreen = SCREEN_MENU;
}

Game.prototype.assetLoadFinished = function()
{
	this._assetLoaded = true;
	this.loadFinished();
}

Game.prototype.renderFrame = function()
{
	this.redraw();
}

Game.prototype.init = function(window)
{
	var i, j, a, dpr, bsr;
	
	this.realCanvas = document.getElementById("c");
	this.realCtx = this.realCanvas.getContext("2d");
	
	// I love the hiDPI display hacks
	dpr = window.devicePixelRatio || 1;
	
	bsr = this.realCtx.webkitBackingStorePixelRatio ||
		this.realCtx.mozBackingStorePixelRatio ||
		this.realCtx.msBackingStorePixelRatio ||
		this.realCtx.oBackingStorePixelRatio ||
		this.realCtx.backingStorePixelRatio || 1;
	
	this.pixelRatio = dpr / bsr;
	
	this.canvas = document.createElement('canvas');
	this.canvas.width = WIDTH;
	this.canvas.height = HEIGHT;
	
	this.ctx = this.canvas.getContext("2d");
	this.ctx.imageSmoothingEnabled = false;
	this.ctx.mozImageSmoothingEnabled = false;
	this.ctx.webkitImageSmoothingEnabled = false;
	this.ctx.msImageSmoothingEnabled = false;
	
	this._asset = new Image();
	this._asset.addEventListener('load', this.assetLoadFinished.bind(this));
	this._asset.src = "./tileset.png";
	
	this.inputHandler = new InputHandler(window);
	
	this.switchScreen(SCREEN_INTRO);
	this.fadeMode = FADE_MODE_IN;
	this.fadePercent = 0;
	
	window.addEventListener('resize', this.onResize.bind(this));
	this.onResize();
	window.setInterval(this.renderFrame.bind(this), 1000 / 12);
}