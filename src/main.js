'use strict';

var G = (function()
{
	var o = {};
	
	/** @const */ o.SCREEN_INTRO = 0;
	/** @const */ o.SCREEN_MENU = 1;
	/** @const */ o.SCREEN_HIGHSCORE = 2;
	/** @const */ o.SCREEN_DIALOG_HELLO = 3;
	/** @const */ o.SCREEN_DIALOG_FAIL1 = 4;
	/** @const */ o.SCREEN_DIALOG_FAIL2 = 5;
	/** @const */ o.SCREEN_GAME = 6;
	
	/** @const */ o.FADE_MODE_NONE = 0;
	/** @const */ o.FADE_MODE_IN = 1;
	/** @const */ o.FADE_MODE_OUT = 2;
	
	o.realCanvas = null;
	o.realCtx = null;
	o.pixelRatio = 1;
	o.zoomLevel = 1;
	o.canvas = null;
	o.ctx = null;
	o._asset = null;
	o._assetLoaded = false;
	o.objectStore = null;
	o.ticks = 0;
	o.waitingForKeypress = false;
	o.player = null;
	
	/** @const */ o.levels = [
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
	
	// thx David @ http://stackoverflow.com/a/15439809
	o.isTouchAvailable = ('ontouchstart' in window) || (navigator.msMaxTouchPoints > 0);
	
	o.currentScreen = o.SCREEN_INTRO;
	o.currentScreenTicks = 0;
	
	o.currentLevel = "";
	
	o.fadeMode = o.FADE_MODE_NONE;
	o.fadePercent = 0; // 0: faded/black ... 100: clear/game screen
	o.validTextCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,:!?()x<>udr@/-_+*=\"'";
	
	o.drawImageAdvanced = function(sctx, dctx, sx, sy, sw, sh, dx, dy, dw, dh, rotated, mirrored)
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
	
	o.drawText = function(posX, posY, content, blinking, width, height, scale)
	{
		width = width ? width : 1000; // characters
		height = height ? height: 1000; // characters
		
		var i, x, y, index;
		
		if (blinking && Math.floor(this.currentScreenTicks / 3) % 2 == 0)
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
			
			if (index === false)
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
	
	o.drawSmallText = function(posX, posY, content, blinking, width, height)
	{
		this.drawText(posX, posY, content, blinking, width, height, 1);
	}
	
	o.drawBigText = function(posX, posY, content, blinking, width, height)
	{
		this.drawText(posX, posY, content, blinking, width, height, 2);
	}
	
	o.drawTile = function(posX, posY, tileNumber, rotated, mirrored, floorOnly)
	{
		if (!floorOnly)
		{
			// this.drawImageAdvanced(this._asset, c, tileNumber * 28, 11, 27, 25, posX, posY, 27, 25, rotated, mirrored);
			this.ctx.drawImage(G._asset, tileNumber * 28, 11, 27, 25, posX, posY, 27, 25);
		}
		else
		{
			this.drawImageAdvanced(this._asset, this.ctx, tileNumber * 28 + 7, 11 + 7, 20, 18, posX + 7, posY + 7, 20, 18, rotated, mirrored);
		}
	}
	
	/** @constructor */
	var Player = function()
	{
		var o;
		
		o = {};
		
		/** @const */ o.NORTH = 0;
		/** @const */ o.EAST = 1;
		/** @const */ o.SOUTH = 2;
		/** @const */ o.WEST = 3;
		
		/** @const */ o.STANDING = 0;
		/** @const */ o.WALKING = 1;
		/** @const */ o.GRAB = 2;
		/** @const */ o.PULLING = 3;
		/** @const */ o.FALLING = 4;
		
		o.orientation = o.NORTH;
		o.status = o.STANDING;
		o.x = 0;
		o.y = 0;
		o.tickCount = 0;
		o.tileNumber = 0;
		o.tileRotated = 0;
		o.tileMirrored = 0;
		
		// [ 0: "rotated?", 1: [ 0: [ 0: "tile", 1: "mirrored?" ], 1: ... ]
		o.animations = [
			[ 0, [ [  6, 0 ]                                  ] ], //  0: north_standing:
			[ 0, [ [  7, 0 ], [  6, 0 ], [  7, 1 ], [  6, 0 ] ] ], //  1: north_walking:
			[ 0, [ [  8, 0 ]                                  ] ], //  2: north_grab:
			[ 0, [ [ 12, 0 ], [  8, 1 ], [ 12, 0 ], [  8, 0 ] ] ], //  3: north_pulling:
			
			[ 1, [ [  9, 0 ]                                  ] ], //  4: east_standing:
			[ 1, [ [ 10, 0 ], [  9, 0 ], [ 10, 1 ], [  9, 0 ] ] ], //  5: east_walking:
			[ 1, [ [ 11, 0 ]                                  ] ], //  6: east_grab:
			[ 1, [ [ 13, 0 ], [ 11, 1 ], [ 13, 0 ], [ 11, 0 ] ] ], //  7: east_pulling:
			
			[ 0, [ [  9, 0 ]                                  ] ], //  8: south_standing:
			[ 0, [ [ 10, 0 ], [  9, 0 ], [ 10, 1 ], [  9, 0 ] ] ], //  9: south_walking:
			[ 0, [ [ 11, 0 ]                                  ] ], // 10: south_grab:
			[ 0, [ [ 13, 0 ], [ 11, 1 ], [ 13, 0 ], [ 11, 0 ] ] ], // 11: south_pulling:
			
			[ 1, [ [  6, 0 ]                                  ] ], // 12: west_standing:
			[ 1, [ [  7, 0 ], [  6, 0 ], [  7, 1 ], [  6, 0 ] ] ], // 13: west_walking:
			[ 1, [ [  8, 0 ]                                  ] ], // 14: west_grab:
			[ 1, [ [ 12, 0 ], [  8, 1 ], [ 12, 0 ], [  8, 0 ] ] ], // 15: west_pulling:
			
			[ 0, []                                             ]  // 16: falling
		];
		o.animationFramesLeft = 0;
		
		o.draw = function(ctx, game)
		{
			game.drawTile(this.x, this.y, this.tileNumber, this.tileRotated, this.tileMirrored, true);
		}
		
		o.setPosition = function(x, y)
		{
		}
		
		o.getPosition = function()
		{
			return [ this.x, this.y ];
		}
		
		o.tick = function()
		{
			var a, b;
			
			this.tickCount++;
			
			if (this.status != this.FALLING)
			{
				a = this.orientation * 4 + this.status;
			}
			else
			{
				a = 16;
			}
			
			b = this.tickCount % this.animations[a].length;
			
			this.tileNumber = this.animations[a][1][b][0];
			this.tileRotated = this.animations[a][0];
			this.tileMirrored = this.animations[a][1][b][1];
		}
		
		return o;
	}
	
	/** @constructor */
	var InputHandler = function(obj)
	{
		var o;
		
		o = {};
		
		o.keyPressed = false;
		
		o.onKeyDown = function(e)
		{
			this.keyPressed = true;
		}
		
		o.onKeyUp = function(e)
		{
		}
		
		o.onTouchStart = function(e)
		{
			this.keyPressed = true;
		}
		
		o.checkIfKeyPressedAndClear = function()
		{
			if (this.keyPressed)
			{
				this.keyPressed = false;
				return true;
			}
			
			return false;
		}
		
		o.clear = function()
		{
			this.keyPressed = false;
		}
		
		o.bind = function(w)
		{
			w.addEventListener('keydown', this.onKeyDown.bind(this));
			w.addEventListener('keyup', this.onKeyUp.bind(this));
			w.addEventListener('touchstart', this.onTouchStart.bind(this));
			
			this.clear();
		}
		
		o.bind(obj);
		
		return o;
	}
	
	o.onResize = function()
	{
		var scale, that, w, h, tmp;
		
		that = this;
		
		tmp = that.zoomLevel;
		
		that.zoomLevel = Math.max(Math.min(Math.floor(window.innerWidth / 420), Math.floor(window.innerHeight / 280)), 0.5);
		
		
		if (that.zoomLevel * that.pixelRatio < 1)
		{
			that.zoomLevel = 1;
			
			// warn the user about viewport clipping
		}
		
		if (that.zoomLevel < 2 && window.innerWidth < window.innerHeight)
		{
			// suggest the use of landscape mode
		}
		
		w = 420 * that.zoomLevel;
		h = 280 * that.zoomLevel;
		
		// this check does not work on mobile. what.
		// if (tmp != that.zoomLevel)
		{
			// I just _really_ love the hiDPI display hacks...
			that.realCanvas.width = w * that.pixelRatio;
			that.realCanvas.height = h * that.pixelRatio;
			
			// these are reset to true on resize
			that.realCtx.imageSmoothingEnabled = false;
			that.realCtx.mozImageSmoothingEnabled = false;
			that.realCtx.webkitImageSmoothingEnabled = false;
			that.realCtx.msImageSmoothingEnabled = false;
			
			that.realCanvas.style.width = w;
			that.realCanvas.style.height = h;
		}
		
		that.realCanvas.style.left = (window.innerWidth - w) / 2;
		that.realCanvas.style.top = (window.innerHeight - h) / 2;
		
	}
	
	o.loadLevel = function(index)
	{
		this.currentLevelWidth = this.levels[index][0];
		this.currentLevelHeight = this.levels[index][1];
		this.currentLevel = this.levels[index][2];
	}
	
	o.switchScreen = function(_new_screen)
	{
		var that = this;
		
		that.currentScreen = _new_screen;
		that.currentScreenTicks = 0;
		
		// initialization of the new screen
		switch (_new_screen)
		{
			case that.SCREEN_INTRO:
				that.waitingForKeypress = true;
				that.nextScreen = that.SCREEN_MENU;
			break;
			
			case that.SCREEN_MENU:
				that.waitingForKeypress = true;
				that.nextScreen = that.SCREEN_GAME;
			break;
			
			case that.SCREEN_GAME:
				that.loadLevel(1);
			break;
		}
		
		// clear all inputs captured during fade
		that.inputHandler.clear();
	}
	
	o.fadeTick = function()
	{
		if (this.fadeMode == this.FADE_MODE_NONE)
		{
			return;
		}
		
		if (this.fadeMode == this.FADE_MODE_OUT && this.fadePercent == 0)
		{
			this.switchScreen(this.nextScreen);
			this.fadeMode = this.FADE_MODE_IN;
		}
		
		if (this.fadeMode == this.FADE_MODE_IN)
		{
			this.fadePercent += 25;
		}
		else if (this.fadeMode == this.FADE_MODE_OUT)
		{
			this.fadePercent -= 25;
		}
		
		this.fadePercent = Math.min(Math.max(this.fadePercent, 0), 100);
		
		if (this.fadePercent == 100)
		{
			this.fadeMode = this.FADE_MODE_NONE;
		}
	}
	
	o.fadeApply = function(ctx, percent)
	{
		ctx.fillStyle = "rgba(85, 85, 85, " + (1 - percent / 100) + ")";
		ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
	}
	
	o.drawScreen = function()
	{
		var that;
		var x, y, a, b, c, width, height;
		
		that = this;
		
		switch (that.currentScreen)
		{
			case that.SCREEN_INTRO:
				that.drawBigText(146, 80, "BOKOSAN");
				that.drawSmallText(122, 100, "FOR JS13KGAMES 2015\n\n  WWW.BOKOSAN.NET");
				if (that.isTouchAvailable)
				{
					that.drawSmallText(96, 200, "TOUCH ANYWHERE TO CONTINUE", true);
				}
				else
				{
					that.drawSmallText(104, 200, "PRESS A KEY TO CONTINUE", true);
				}
			break;
			
			case that.SCREEN_MENU:
				that.drawBigText(0, 0, "BOKOSAN");
				that.drawSmallText(0, 20, "A REVERSE SOKOBAN FOR JS13KGAMES 2015");
				that.drawSmallText(0, 270, "GITHUB.COM/GHEJA/BOKOSAN - WWW.BOKOSAN.NET");
			break;
			
			case that.SCREEN_GAME:
				
				for (y=0; y<that.currentLevelHeight; y++)
				{
					for (x=0; x<that.currentLevelWidth; x++)
					{
						c = that.currentLevel[y * that.currentLevelWidth + x];
						a = x * 20;
						b = y * 18;
						
						switch (c)
						{
							case "w": // wall
								this.drawTile(a, b, 0)
							break;
							
							case "P": // floor and player
								this.drawTile(a, b, 2);
								this.drawTile(a, b, 4);
							break;
							
							case ".":
								this.drawTile(a, b, 2);
							break;
							
							case "B":
								this.drawTile(a, b, 3);
								this.drawTile(a, b, 1);
							break;
							
							case "/":
								this.drawTile(a, b, 3);
							break;
							
							default:
								continue;
							break;
						}
					}
				}
			break;
		}
	}
	
	o.redraw = function()
	{
		if (!this._assetLoaded)
		{
			return;
		}
		
		this.fadeTick();
		
		if (this.fadeMode == this.FADE_MODE_NONE)
		{
			this.ticks++;
			this.currentScreenTicks++;
			
			if (this.waitingForKeypress)
			{
				if (this.inputHandler.checkIfKeyPressedAndClear())
				{
					this.fadeMode = this.FADE_MODE_OUT;
					this.waitingForKeypress = false;
				}
			}
		}
		
		this.ctx.fillStyle = "#555";
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		
		this.drawScreen();
		
		this.fadeApply(this.ctx, this.fadePercent);
		
		this.realCtx.drawImage(this.canvas, 0, 0, this.canvas.width, this.canvas.height, 0, 0, this.canvas.width * this.pixelRatio * this.zoomLevel, this.canvas.height * this.pixelRatio * this.zoomLevel);
	}
	
	o.assetLoadFinished = function()
	{
		this._assetLoaded = true;
	}
	
	o.renderFrame = function()
	{
		this.redraw();
	}
	
	o.init = function()
	{
		var that, i, j, a, dpr, bsr;
		
		that = this;
		
		that.realCanvas = document.getElementById("c");
		that.realCtx = that.realCanvas.getContext("2d");
		
		// I love the hiDPI display hacks
		dpr = window.devicePixelRatio || 1;
		
		bsr = that.realCtx.webkitBackingStorePixelRatio ||
			that.realCtx.mozBackingStorePixelRatio ||
			that.realCtx.msBackingStorePixelRatio ||
			that.realCtx.oBackingStorePixelRatio ||
			that.realCtx.backingStorePixelRatio || 1;
		
		that.pixelRatio = dpr / bsr;
		
		that.canvas = document.createElement('canvas');
		that.canvas.width = 420;
		that.canvas.height = 280;
		
		that.ctx = that.canvas.getContext("2d");
		that.ctx.imageSmoothingEnabled = false;
		that.ctx.mozImageSmoothingEnabled = false;
		that.ctx.webkitImageSmoothingEnabled = false;
		that.ctx.msImageSmoothingEnabled = false;
		
		that._asset = new Image();
		that._asset.addEventListener('load', that.assetLoadFinished.bind(that));
		that._asset.src = "./tileset.png";
		
		that.inputHandler = new InputHandler(window);
		
		that.player = new Player();
		
		that.switchScreen(that.SCREEN_INTRO);
		that.fadeMode = that.FADE_MODE_IN;
		that.fadePercent = 0;
		
		window.addEventListener('resize', that.onResize.bind(that));
		that.onResize();
		window.setInterval(that.renderFrame.bind(that), 1000 / 6);
	}
	
	return o;
})();

window.addEventListener('load', G.init.bind(G));
