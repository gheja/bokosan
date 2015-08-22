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
	
	// thx David @ http://stackoverflow.com/a/15439809
	o.isTouchAvailable = ('ontouchstart' in window) || (navigator.msMaxTouchPoints > 0);
	
	o.currentScreen = o.SCREEN_INTRO;
	o.currentScreenTicks = 0;
	
	o.fadeMode = o.FADE_MODE_NONE;
	o.fadePercent = 0; // 0: faded/black ... 100: clear/game screen
	
	/** @constructor */
	var Obj = function(_x, _y, _order)
	{
		var o;
		
		o = {};
		o.pos = { x: _x, y: _y };
		o.tickCount = 0;
		o.tick = function()
		{
			this.tickCount++;
		}
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
		
		return o
	}
	
	/** @constructor */
	var SmallText = function(_x, _y, _content, _width, _height, _blinking)
	{
		var o;
		
		o = new Obj(_x, _y);
		o.characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,:!?()x<>udr@/-_+*=\"'";
		o.content = _content;
		o.scale = 1;
		o.width = _width ? _width : 1000; // characters
		o.height = _height ? _height: 1000; // characters
		o.blinking = !!_blinking;
		
		o.draw = function(c)
		{
			var i, x, y, index;
			
			if (this.blinking && Math.floor(this.tickCount / 3) % 2 == 0)
			{
				return;
			}
			
			x = 0;
			y = 0;
			for (i=0; i<this.content.length; i++)
			{
				if (this.content[i] == "\n")
				{
					x = 0;
					y++;
					continue;
				}
				
				index = o.characters.indexOf(this.content[i]);
				
				if (index === false)
				{
					continue;
				}
				
				c.drawImage(G._asset, index * 7, 0, 7, 10, this.pos.x + x * 8 * this.scale, this.pos.y + y * 10 * this.scale, 7 * this.scale, 10 * this.scale);
				
				x++;
				
				if (x > this.width)
				{
					x = 0;
					y++;
				}
			}
		}
		
		return o;
	}
	
	/** @constructor */
	var BigText = function(_x, _y, _content, _width, _height, _blinking)
	{
		var o;
		
		o = new SmallText(_x, _y, _content, _width, _height, _blinking);
		o.scale = 2;
		
		return o;
	}
	
	/** @constructor */
	var LevelObj = function(_x, _y, _tile_number)
	{
		var o;
		
		o = new Obj(_x, _y);
		o.tile_number = _tile_number;
		o.draw = function(c)
		{
			c.drawImage(G._asset, this.tile_number * 28, 11, 27, 25, this.pos.x, this.pos.y, 27, 25);
		}
		
		return o;
	}
	
	var PlayerObj = function(_x, _y)
	{
		var o;
		
		// test stuff
		var i, j, a;
		
		o = new LevelObj(_x, _y);
		o.tile_number = 6;
		o.rotated = 0;
		o.mirrored = 0;
		o.tickCount = 0;
		
		// test stuff
		o.animation = [];
		
		o.draw = function(c)
		{
			this.drawImageAdvanced(G._asset, c, this.tile_number * 28 + 7, 11 + 7, 20, 18, this.pos.x + 7, this.pos.y + 7, 20, 18, this.rotated, this.mirrored);
		}
		o.tick = function()
		{
			var i, a;
			
			this.tickCount++;
			
			// test stuff
			a = this.animation[this.tickCount % this.animation.length];
			
			this.tile_number = a.tile;
			this.rotated = a.rotated;
			this.mirrored = a.mirrored;
		}
		
		//// test stuffs
		a = [
			//// north
			// stand
			[ 6, 0, 0, 5 ],
			// walk
			[ 7, 0, 0, 1 ], [ 6, 0, 0, 1 ], [ 7, 0, 1, 1 ], [ 6, 0, 0, 1 ], /* repeat */
			[ 7, 0, 0, 1 ], [ 6, 0, 0, 1 ], [ 7, 0, 1, 1 ], [ 6, 0, 0, 1 ],
			[ 7, 0, 0, 1 ], [ 6, 0, 0, 1 ], [ 7, 0, 1, 1 ], [ 6, 0, 0, 1 ],
			[ 7, 0, 0, 1 ], [ 6, 0, 0, 1 ], [ 7, 0, 1, 1 ], [ 6, 0, 0, 1 ],
			 // grab
			[ 8, 0, 0, 5 ],
			// drag
			[ 12, 0, 0, 1 ], [ 8, 0, 1, 1 ], [ 12, 0, 0, 1 ], [ 8, 0, 0, 1 ], /* repeat */
			[ 12, 0, 0, 1 ], [ 8, 0, 1, 1 ], [ 12, 0, 0, 1 ], [ 8, 0, 0, 1 ],
			[ 12, 0, 0, 1 ], [ 8, 0, 1, 1 ], [ 12, 0, 0, 1 ], [ 8, 0, 0, 1 ],
			[ 12, 0, 0, 1 ], [ 8, 0, 1, 1 ], [ 12, 0, 0, 1 ], [ 8, 0, 0, 1 ],
			
			//// east
			// stand
			[ 9, 1, 0, 5 ],
			// walk
			[ 10, 1, 0, 1 ], [ 9, 1, 0, 1 ], [ 10, 1, 1, 1 ], [ 9, 1, 0, 1 ], /* repeat */
			[ 10, 1, 0, 1 ], [ 9, 1, 0, 1 ], [ 10, 1, 1, 1 ], [ 9, 1, 0, 1 ],
			[ 10, 1, 0, 1 ], [ 9, 1, 0, 1 ], [ 10, 1, 1, 1 ], [ 9, 1, 0, 1 ],
			[ 10, 1, 0, 1 ], [ 9, 1, 0, 1 ], [ 10, 1, 1, 1 ], [ 9, 1, 0, 1 ],
			 // grab
			[ 11, 1, 0, 5 ],
			// drag
			[ 13, 1, 0, 1 ], [ 11, 1, 1, 1 ], [ 13, 1, 0, 1 ], [ 11, 1, 0, 1 ], /* repeat */
			[ 13, 1, 0, 1 ], [ 11, 1, 1, 1 ], [ 13, 1, 0, 1 ], [ 11, 1, 0, 1 ],
			[ 13, 1, 0, 1 ], [ 11, 1, 1, 1 ], [ 13, 1, 0, 1 ], [ 11, 1, 0, 1 ],
			[ 13, 1, 0, 1 ], [ 11, 1, 1, 1 ], [ 13, 1, 0, 1 ], [ 11, 1, 0, 1 ],
			
			//// south
			// stand
			[ 9, 0, 0, 5 ],
			// walk
			[ 10, 0, 0, 1 ], [ 9, 0, 0, 1 ], [ 10, 0, 1, 1 ], [ 9, 0, 0, 1 ], /* repeat */
			[ 10, 0, 0, 1 ], [ 9, 0, 0, 1 ], [ 10, 0, 1, 1 ], [ 9, 0, 0, 1 ],
			[ 10, 0, 0, 1 ], [ 9, 0, 0, 1 ], [ 10, 0, 1, 1 ], [ 9, 0, 0, 1 ],
			[ 10, 0, 0, 1 ], [ 9, 0, 0, 1 ], [ 10, 0, 1, 1 ], [ 9, 0, 0, 1 ],
			 // grab
			[ 11, 0, 0, 5 ],
			// drag
			[ 13, 0, 0, 1 ], [ 11, 0, 1, 1 ], [ 13, 0, 0, 1 ], [ 11, 0, 0, 1 ], /* repeat */
			[ 13, 0, 0, 1 ], [ 11, 0, 1, 1 ], [ 13, 0, 0, 1 ], [ 11, 0, 0, 1 ],
			[ 13, 0, 0, 1 ], [ 11, 0, 1, 1 ], [ 13, 0, 0, 1 ], [ 11, 0, 0, 1 ],
			[ 13, 0, 0, 1 ], [ 11, 0, 1, 1 ], [ 13, 0, 0, 1 ], [ 11, 0, 0, 1 ],
			
			//// west
			// stand
			[ 6, 1, 0, 5 ],
			// walk
			[ 7, 1, 0, 1 ], [ 6, 1, 0, 1 ], [ 7, 1, 1, 1 ], [ 6, 1, 0, 1 ], /* repeat */
			[ 7, 1, 0, 1 ], [ 6, 1, 0, 1 ], [ 7, 1, 1, 1 ], [ 6, 1, 0, 1 ],
			[ 7, 1, 0, 1 ], [ 6, 1, 0, 1 ], [ 7, 1, 1, 1 ], [ 6, 1, 0, 1 ],
			[ 7, 1, 0, 1 ], [ 6, 1, 0, 1 ], [ 7, 1, 1, 1 ], [ 6, 1, 0, 1 ],
			 // grab
			[ 8, 1, 0, 5 ],
			// drag
			[ 12, 1, 0, 1 ], [ 8, 1, 1, 1 ], [ 12, 1, 0, 1 ], [ 8, 1, 0, 1 ], /* repeat */
			[ 12, 1, 0, 1 ], [ 8, 1, 1, 1 ], [ 12, 1, 0, 1 ], [ 8, 1, 0, 1 ],
			[ 12, 1, 0, 1 ], [ 8, 1, 1, 1 ], [ 12, 1, 0, 1 ], [ 8, 1, 0, 1 ],
			[ 12, 1, 0, 1 ], [ 8, 1, 1, 1 ], [ 12, 1, 0, 1 ], [ 8, 1, 0, 1 ]
		];
		
		for (i=0; i<a.length; i++)
		{
			for (j=0; j<a[i][3]; j++)
			{
				o.animation.push({ tile: a[i][0], rotated: a[i][1], mirrored: a[i][2] });
			}
		}
		////
		
		return o;
	}
	
	/** @constructor */
	var ObjectStore = function()
	{
		var o;
		
		o = {};
		o.objects = [];
		o.dirty = false;
		
		o.add = function(obj, _order)
		{
			obj.order = _order;
			
			this.objects.push(obj);
			
			this.dirty = true;
			
			return obj;
		}
		
		o.reorder = function()
		{
			o.dirty = false;
		}
		
		o.draw = function(c)
		{
			var i;
			
			if (this.dirty)
			{
				this.reorder();
			}
			
			for (i=0; i<this.objects.length; i++)
			{
				this.objects[i].draw(c);
			}
		}
		
		o.tick = function(c)
		{
			var i;
			
			for (i=0; i<this.objects.length; i++)
			{
				this.objects[i].tick();
			}
		}
		
		o.clear = function()
		{
			var i;
			
			for (i=this.objects.length - 1; i >= 0; i--)
			{
				delete(this.objects[i]);
			}
			
			this.objects = [];
		}
		
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
	
	o.switchScreen = function(_new_screen)
	{
		var that = this;
		
		that.objectStore.clear();
		
		that.currentScreen = _new_screen;
		that.currentScreenTicks = 0;
		
		// initialization of the new screen
		switch (_new_screen)
		{
			case that.SCREEN_INTRO:
				that.objectStore.add(new BigText(146, 80, "BOKOSAN"), 10);
				that.objectStore.add(new SmallText(122, 100, "FOR JS13KGAMES 2015\n\n  WWW.BOKOSAN.NET"), 10);
				if (that.isTouchAvailable)
				{
					that.objectStore.add(new SmallText(96, 200, "TOUCH ANYWHERE TO CONTINUE", null, null, true), 10);
				}
				else
				{
					that.objectStore.add(new SmallText(104, 200, "PRESS A KEY TO CONTINUE", null, null, true), 10);
				}
			break;
			
			case that.SCREEN_MENU:
				that.objectStore.add(new BigText(0, 0, "BOKOSAN"), 10);
				that.objectStore.add(new SmallText(0, 20, "A REVERSE SOKOBAN FOR JS13KGAMES 2015"), 10);
				that.objectStore.add(new SmallText(0, 270, "GITHUB.COM/GHEJA/BOKOSAN - WWW.BOKOSAN.NET"), 10);
			break;
		}
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
			this.fadePercent += 33;
		}
		else if (this.fadeMode == this.FADE_MODE_OUT)
		{
			this.fadePercent -= 33;
		}
		
		this.fadePercent = Math.min(Math.max(this.fadePercent, 0), 100);
		
		if (this.fadePercent == 100)
		{
			this.fadeMode = this.FADE_MODE_NONE;
		}
	}
	
	o.fadeApply = function(ctx, alpha)
	{
		this.ctx.fillStyle = "rgba(85, 85, 85, " + (1 - alpha / 100) + ")";
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
	}
	
	o.redraw = function()
	{
		if (!this._assetLoaded)
		{
			return;
		}
		
		this.ticks++;
		this.currentScreenTicks++;
		
		this.fadeTick();
		
		if (this.fadeMode == this.FADE_MODE_NONE)
		{
			this.objectStore.tick();
		}
		
		this.ctx.fillStyle = "#555";
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		
		this.objectStore.draw(this.ctx);
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
		
		that.objectStore = new ObjectStore();
		
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
