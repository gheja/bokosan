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
	this.levelPadX = 0;
	this.levelPadY = 0;
	this.ticks = 0;
	this.storage = null; // == window.localStorage
	this.currentStats = [
		0, // STAT_FRAMES
		0, // STAT_MOVES
		0, // STAT_PULLS
		0, // STAT_LEVELS_STARTED
		0  // STAT_LEVELS_FINISHED
	];
	this.sounds = [];
	this.waitingForKeypress = false;
	/** @type {Menu} */ this.currentMenu = null;
	/** @type {Array<Menu>} */this.menus = [
		// MENU_MAIN
		new Menu(this, [
			[ "PLAY", ACTION_OPEN_MENU, MENU_PLAY ],
			[ "OPTIONS", ACTION_OPEN_MENU, MENU_OPTIONS ],
			[ "HOW TO PLAY", ACTION_CHANGE_SCREEN, SCREEN_HOWTO ],
			[ "ABOUT", ACTION_CHANGE_SCREEN, SCREEN_ABOUT ]
		]),
		
		// MENU_PLAY
		new Menu(this, [
			[ "SINGLE PLAYER", ACTION_CHANGE_SCREEN, SCREEN_LEVELS ],
			[ "ONLINE CHALLENGE", ACTION_CHANGE_SCREEN, SCREEN_CHALLENGES ],
			[ "CUSTOMIZE", ACTION_OPEN_MENU, MENU_PLAY ],
			[ "BACK TO MENU", ACTION_OPEN_MENU, MENU_MAIN ]
		]),
		
		// MENU_OPTIONS
		new Menu(this, [
			[ "BACK TO MENU", ACTION_OPEN_MENU, MENU_MAIN ]
		]),
		
		// MENU_PAUSED
		new Menu(this, [
			[ "CONTINUE", ACTION_OPEN_MENU, MENU_MAIN ],
			[ "BACK TO MENU", ACTION_OPEN_MENU, MENU_MAIN ]
		])
	];
	
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
			// width, height, A+ limit, level data
			7, 7, 13,
			"wwwwwww" +
			"w/B///w" +
			"w/////w" +
			"wwww//w" +
			" w....w" +
			" w.P..w" +
			" wwwwww"
		],
		// 2
		[
			// width, height, A+ limit, level data
			9, 7, 37,
			"   wwwww " +
			"wwww.P.w " +
			"wBB/...ww" +
			"wBB/....w" +
			"wwww...ww" +
			"   w...w " +
			"   wwwww "
		],
		// 3
		[
			// width, height, A+ limit, level data
			9, 8, 37,
			"     wwww" +
			"wwwwww//w" +
			"wb.P////w" +
			"w..w////w" +
			"w..w//www" +
			"waaw/B/Bw" +
			"wwwwB/B/w" +
			"   wwwwww"
		]
	];
	
	this.screens = [
		new ScreenTitle(),
		new ScreenIntro(),
		new ScreenMenu(),
		new ScreenLevel(),
		new ScreenLevels(),
		new ScreenChallenges(),
		new ScreenAbout(),
		new ScreenHowto()
	];
	/** @type {Screen} */ this.currentScreen = null;
	this.currentLevel = null;
	
	this.fadeMode = FADE_MODE_NONE;
	this.fadePercent = 0; // 0: faded/black ... 100: clear/game screen
	this.validTextCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,:!?()x<>udr@/-_+*=\"'";
	this.inputHandler = null;
	this.touchHandler = null;
}

Game.prototype.fixCanvasContextSmoothing = function(ctx)
{
	ctx.imageSmoothingEnabled = false;
	ctx.mozImageSmoothingEnabled = false;
	ctx.webkitImageSmoothingEnabled = false;
	ctx.msImageSmoothingEnabled = false;
}

Game.prototype.setWaitForKeypress = function(_nextScreen)
{
	this.waitingForKeypress = true;
	this.nextScreen = _nextScreen;
}

Game.prototype.pad = function(i, length, padder)
{
	var s;
	
	s = i.toString();
	
	while (s.length < length)
	{
		s = padder + s;
	}
	
	return s;
}

Game.prototype.thousandPad = function(num)
{
	// thx Elias Zamaria @ http://stackoverflow.com/a/2901298
	// NOTE: will work only for integers
	return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

Game.prototype.timePad = function(t)
{
	t = Math.floor(t);
	return Math.floor(t / 3600) + ":" + this.pad(Math.floor((t % 3600) / 60), 2, '0') + ":"+ this.pad(t % 60, 2, '0');
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

Game.prototype.statGetLocalStorageValue = function(statKey)
{
	return parseInt(this.storage.getItem('s' + statKey) || 0, 10);
	// shorter but uglier: return this.storage.getItem('s' + statKey) * 1;
}

Game.prototype.statIncrease = function(statKey)
{
	this.currentStats[statKey]++;
	if (this.storage)
	{
		this.storage.setItem('s' + statKey, this.statGetLocalStorageValue(statKey) + 1);
	}
}

Game.prototype.addSounds = function(sounds)
{
	var i;
	
	for (i in sounds)
	{
		this.sounds.push(Jsfxr(sounds[i], true));
	}
}

Game.prototype.playSound = function(id)
{
	if (this.sounds[id].currentTime != this.sounds[id].duration)
	{
		this.sounds[id].currentTime = 0;
	}
	
	this.sounds[id].play();
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

Game.prototype.drawText = function(posX, posY, content, scale)
{
	var i, x, y, index;
	
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
	}
}

Game.prototype.drawSmallText = function(posX, posY, content)
{
	this.drawText(posX, posY, content, 1);
}

Game.prototype.drawSmallTextBlinking = function(posX, posY, content)
{
	if (Math.floor(this.ticks / 6) % 2 == 1)
	{
		this.drawText(posX, posY, content, 1);
	}
}

Game.prototype.drawBigText = function(posX, posY, content)
{
	this.drawText(posX, posY, content, 2);
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
		this.fixCanvasContextSmoothing(this.realCtx);
		
		this.realCanvas.style.width = w;
		this.realCanvas.style.height = h;
	}
	
	this.realCanvas.style.left = (window.innerWidth - w) / 2;
	this.realCanvas.style.top = (window.innerHeight - h) / 2;
	
}

Game.prototype.loadLevel = function(index)
{
	var x, y, a, b;
	
	this.currentStats[STAT_FRAMES] = 0;
	this.currentStats[STAT_MOVES] = 0;
	this.currentStats[STAT_PULLS] = 0;
	this.statIncrease(STAT_LEVELS_STARTED);
	
	this.currentLevel = this.levels[index];
	
	this.levelPadX = Math.floor((WIDTH - this.currentLevel[LEVEL_DATA_WIDTH] * 20 - 10) / 2);
	this.levelPadY = Math.floor((HEIGHT - this.currentLevel[LEVEL_DATA_HEIGHT] * 18 - 9) / 2);
	
	this.objects.length = 0;
	this.player = null;
	
	for (y=0; y<this.currentLevel[LEVEL_DATA_HEIGHT]; y++)
	{
		for (x=0; x<this.currentLevel[LEVEL_DATA_WIDTH]; x++)
		{
			a = x * 20;
			b = y * 18;
			
			switch (this.currentLevel[LEVEL_DATA_TILES][y * this.currentLevel[LEVEL_DATA_WIDTH] + x])
			{
				case "P": // the player
					this.player = new PlayerObj(game, a, b);
					this.objects.push(this.player);
				break;
				
				case "B": // a box
					this.objects.push(new BoxObj(game, a, b));
				break;
			}
		}
	}
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
		if (this.objects[i] instanceof BoxObj && this.objects[i].getNeighbourTile(0, 0) != '.')
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

Game.prototype.openMenu = function(id)
{
	this.currentMenu = this.menus[id];
}

Game.prototype.switchScreen = function(_new_screen)
{
	this.currentScreen = this.screens[_new_screen];
	this.currentScreen.init(this);
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

Game.prototype.redraw = function()
{
	if (!this._assetLoaded)
	{
		return;
	}
	
	this.fadeTick();
	
	if (this.fadeMode == FADE_MODE_NONE)
	{
		this.ticks++;
		
		if (this.waitingForKeypress)
		{
			if (this.inputHandler.checkIfKeyPressedAndClear())
			{
				this.fadeMode = FADE_MODE_OUT;
				this.waitingForKeypress = false;
				this.playSound(SOUND_NEXT);
			}
		}
		
		this.currentScreen.tick(this);
	}
	
	this.ctx.fillStyle = "#555";
	this.ctx.fillRect(0, 0, WIDTH, HEIGHT);
	
	this.currentScreen.draw(this);
	
	this.fadeApply(this.ctx, this.fadePercent);
	
	this.realCtx.drawImage(this.canvas, 0, 0, WIDTH, HEIGHT, 0, 0, WIDTH * this.pixelRatio * this.zoomLevel, HEIGHT * this.pixelRatio * this.zoomLevel);
}

Game.prototype.loadFinished = function()
{
	this.setWaitForKeypress(SCREEN_INTRO);
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
	this.fixCanvasContextSmoothing(this.ctx);
	
	this._asset = new Image();
	this._asset.addEventListener('load', this.assetLoadFinished.bind(this));
	this._asset.src = "./tileset.png";
	
	this.inputHandler = new InputHandler(window);
	this.touchHandler = new TouchHandler(this.inputHandler, 200, 200, window);
	
	this.switchScreen(SCREEN_TITLE);
	this.fadeMode = FADE_MODE_IN;
	this.fadePercent = 0;
	
	this.addSounds([
		[,,0.2,0.03,0.5,0.65,,,,,,0.42,0.54,,,,,,1,-1,,,-1,0.4], // SOUND_HELLO
		[,0.01,0.01,0.1,0.05,0.65,,,,,,,,,,,,,1,-1,,,-1,0.5], // SOUND_MENU
		[,0.09,0.02,,0.11,0.11,,,,,,,,0.53,,,-0.27,,0.23,,,,,0.5], // SOUND_STEP1
		[,0.09,0.02,,0.11,0.11,,,,,,,,0.53,,,0.37,,0.23,,,,,0.5], // SOUND_STEP2
		[3,0.06,0.02,,0.16,0.16,,,,,,,,0.53,,,0.37,,0.3,,,,,0.5], // SOUND_BOX_GRAB
		[3,0.06,0.02,,0.16,0.16,,,,,,,,0.53,,,-0.3,,0.3,,,,,0.5], // SOUND_BOX_RELEASE
		[3,0.19,0.23,,0.31,0.2,,0.04,,,,,,,,,-0.37,,0.23,,,0.29,,0.5], // SOUND_BOX_PULL
		[,0.07,0.02,,0.11,0.82,,,,,,,,,-0.44,,,,1,,,,,0.5], // SOUND_TEXT
		// [,0.01,0.01,0.1,0.05,0.65,,,,,,,,,,,,,1,-1,,,-1,0.5] // SOUND_NEXT
		// [,0.026,0.026,0.1,0.13,0.65,,0.3,,,,,,,,,,,1,-1,,,-1,0.5] // SOUND_NEXT
		[,0.01,0.01,0.1,0.05,0.7,,,,,,,,,,,,,1,-1,,,-1,0.5] // SOUND_NEXT
	]);
	
	this.storage = window.localStorage;
	
	window.addEventListener('resize', this.onResize.bind(this));
	this.onResize();
	window.setInterval(this.renderFrame.bind(this), 1000 / 12);
}
