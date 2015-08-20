'use strict';

var G = (function()
{
	var o = {};
	
	o.realCanvas = null;
	o.realCtx = null;
	o.pixelRatio = 1;
	o.zoomLevel = 1;
	o.canvas = null;
	o.ctx = null;
	o._asset = null;
	o._assetLoaded = false;
	o.objectStore = null;
	
	o.map = "" +
	"...................." +
	"........wwwwwww....." +
	"...wwwwww.....w....." +
	"...w////www...w....." +
	"...w/XX/w.....w....." +
	"...w/XX/w.....w....." +
	"...w////www...w....." +
	"...www//......w....." +
	".....w//...S..w....." +
	".....www......w....." +
	".......wwwwwwww....." +
	"...................." +
	"...................." +
	"...................." +
	"...................." +
	"....................";
	
	/** @constructor */
	var Obj = function(_x, _y, _order)
	{
		var o;
		
		o = {};
		o.pos = { x: _x, y: _y };
		o.tick = function() {};
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
	var SmallText = function(_x, _y, _content, _width, _height)
	{
		var o;
		
		o = new Obj(_x, _y);
		o.characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,:!?()x<>udr@/-_+*=\"'";
		o.content = _content;
		o.scale = 1;
		o.width = _width ? _width : 1000; // characters
		o.height = _height ? _height: 1000; // characters
		
		o.draw = function(c)
		{
			var i, x, y, index;
			
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
	var BigText = function(_x, _y, _content, _width, _height)
	{
		var o;
		
		o = new SmallText(_x, _y, _content, _width, _height);
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
		
		// temp stuff
		var i, j, a;
		
		o = new LevelObj(_x, _y);
		o.tile_number = 6;
		o.rotated = 0;
		o.mirrored = 0;
		o.tickCount = 0;
		
		// temp stuff
		o.animation = [];
		
		o.draw = function(c)
		{
			this.drawImageAdvanced(G._asset, c, this.tile_number * 28 + 7, 11 + 7, 20, 18, this.pos.x + 7, this.pos.y + 7, 20, 18, this.rotated, this.mirrored);
		}
		o.tick = function()
		{
			var i, a;
			
			this.tickCount++;
			
			a = this.animation[this.tickCount % this.animation.length];
			
			this.tile_number = a.tile;
			this.rotated = a.rotated;
			this.mirrored = a.mirrored;
		}
		
		//// temp stuffs
		a = [
			//// north
			// stand
			[ 6, 0, 0, 5 ],
			// walk
			[ 7, 0, 0, 1 ], [ 6, 0, 0, 1 ], [ 7, 0, 1, 1 ], [ 6, 0, 0, 1 ], /* repeat */ [ 7, 0, 0, 1 ], [ 6, 0, 0, 1 ], [ 7, 0, 1, 1 ], [ 6, 0, 0, 1 ], [ 7, 0, 0, 1 ], [ 6, 0, 0, 1 ], [ 7, 0, 1, 1 ], [ 6, 0, 0, 1 ], [ 7, 0, 0, 1 ], [ 6, 0, 0, 1 ], [ 7, 0, 1, 1 ],
			 // grab
			[ 8, 0, 0, 5 ], 
			// drag
			[ 8, 0, 1, 1 ], [ 8, 0, 0, 1 ], /* repeat */ [ 8, 0, 1, 1 ], [ 8, 0, 0, 1 ], [ 8, 0, 1, 1 ], [ 8, 0, 0, 1 ], [ 8, 0, 1, 1 ], [ 8, 0, 0, 1 ],
			
			//// east
			// stand
			[ 9, 1, 0, 5 ],
			// walk
			[ 10, 1, 0, 1 ], [ 9, 1, 0, 1 ], [ 10, 1, 1, 1 ], [ 9, 1, 0, 1 ], /* repeat */ [ 10, 1, 0, 1 ], [ 9, 1, 0, 1 ], [ 10, 1, 1, 1 ], [ 9, 1, 0, 1 ], [ 10, 1, 0, 1 ], [ 9, 1, 0, 1 ], [ 10, 1, 1, 1 ], [ 9, 1, 0, 1 ], [ 10, 1, 0, 1 ], [ 9, 1, 0, 1 ], [ 10, 1, 1, 1 ],
			 // grab
			[ 11, 1, 0, 5 ],
			// drag
			[ 11, 1, 1, 1 ], [ 11, 1, 0, 1 ], /* repeat */ [ 11, 1, 1, 1 ], [ 11, 1, 0, 1 ], [ 11, 1, 1, 1 ], [ 11, 1, 0, 1 ], [ 11, 1, 1, 1 ], [ 11, 1, 0, 1 ],
			
			//// south
			// stand
			[ 9, 0, 0, 5 ],
			// walk
			[ 10, 0, 0, 1 ], [ 9, 0, 0, 1 ], [ 10, 0, 1, 1 ], [ 9, 0, 0, 1 ], /* repeat */ [ 10, 0, 0, 1 ], [ 9, 0, 0, 1 ], [ 10, 0, 1, 1 ], [ 9, 0, 0, 1 ], [ 10, 0, 0, 1 ], [ 9, 0, 0, 1 ], [ 10, 0, 1, 1 ], [ 9, 0, 0, 1 ], [ 10, 0, 0, 1 ], [ 9, 0, 0, 1 ], [ 10, 0, 1, 1 ],
			 // grab
			[ 11, 0, 0, 5 ],
			// drag
			[ 11, 0, 1, 1 ], [ 11, 0, 0, 1 ], /* repeat */ [ 11, 0, 1, 1 ], [ 11, 0, 0, 1 ], [ 11, 0, 1, 1 ], [ 11, 0, 0, 1 ], [ 11, 0, 1, 1 ], [ 11, 0, 0, 1 ],
			
			//// west
			// stand
			[ 6, 1, 0, 5 ],
			// walk
			[ 7, 1, 0, 1 ], [ 6, 1, 0, 1 ], [ 7, 1, 1, 1 ], [ 6, 1, 0, 1 ], /* repeat */ [ 7, 1, 0, 1 ], [ 6, 1, 0, 1 ], [ 7, 1, 1, 1 ], [ 6, 1, 0, 1 ], [ 7, 1, 0, 1 ], [ 6, 1, 0, 1 ], [ 7, 1, 1, 1 ], [ 6, 1, 0, 1 ], [ 7, 1, 0, 1 ], [ 6, 1, 0, 1 ], [ 7, 1, 1, 1 ],
			 // grab
			[ 8, 1, 0, 5 ],
			// drag
			[ 8, 1, 1, 1 ], [ 8, 1, 0, 1 ], /* repeat */ [ 8, 1, 1, 1 ], [ 8, 1, 0, 1 ], [ 8, 1, 1, 1 ], [ 8, 1, 0, 1 ], [ 8, 1, 1, 1 ], [ 8, 1, 0, 1 ]
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
				this.objects[i].tick();
			}
			
			for (i=0; i<this.objects.length; i++)
			{
				this.objects[i].draw(c);
			}
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
	
	o.redraw = function()
	{
		if (!this._assetLoaded)
		{
			return;
		}
		
		this.ctx.fillStyle = "#555";
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		
		this.objectStore.draw(this.ctx);
		
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
		that.objectStore.add(new BigText(0, 0, "BOKOSAN"), 10);
		that.objectStore.add(new SmallText(0,  20, "A REVERSE SOKOBAN FOR JS13KGAMES 2015"), 10);
		that.objectStore.add(new SmallText(0, 40, "TOTAL TIME PLAYED"), 10);
		that.objectStore.add(new BigText(0, 50, "  131:54:22"), 10);
		that.objectStore.add(new SmallText(0, 80, "TOTAL MOVES"), 10);
		that.objectStore.add(new BigText(0, 90, "  9,612,334"), 10);
		that.objectStore.add(new SmallText(0, 120, "TOTAL PULLS"), 10);
		that.objectStore.add(new BigText(0, 130, "     84,414"), 10);
		
		that.objectStore.add(new SmallText(188,  40, "xBOB SANYI:\n  HI GUYS!\nxJOHN BELA:\n  SEJJ\n>xJACK DANIELS FINISHED L17 <\n> 0:17:45, 1278 M, 33 P     <\nxJACK DANIELS:\n  EEE-E LOREM IPSUM?\nxJOHN BELA:\n  ASDF GH JK LMNO\nxJOHN BELA:\n  THE QUICK BROWN FOX JUMPED \n  OVER THE LAZY BUKSI AND\n  SALLALA\n"), 10);
		
		that.objectStore.add(new SmallText(220, 190, "       u   UP "), 10);
		that.objectStore.add(new SmallText(220, 200, "LEFT <   > RIGHT "), 10);
		that.objectStore.add(new SmallText(220, 210, "       d   DOWN"), 10);
		that.objectStore.add(new SmallText(220, 220, "r ROTATE SCREEN"), 10);
		that.objectStore.add(new SmallText(220, 240, "ASD_FGH@I-JKL.MN   x"), 10);
		that.objectStore.add(new SmallText(220, 250, "1*2-3+4=5 ISN'T \"AS-IS\""), 10);
		that.objectStore.add(new SmallText(220, 260, "HTTP://BOKOSAN.NET/"), 10);
		
		that.objectStore.add(new LevelObj( 40, 164, 0));
		that.objectStore.add(new LevelObj( 60, 164, 0));
		that.objectStore.add(new LevelObj( 80, 164, 0));
		that.objectStore.add(new LevelObj(100, 164, 2));
		that.objectStore.add(new LevelObj(120, 164, 2));
		that.objectStore.add(new LevelObj(140, 164, 2));
		that.objectStore.add(new LevelObj(160, 164, 0));
		
		that.objectStore.add(new LevelObj( 40, 182, 0));
		that.objectStore.add(new LevelObj( 60, 182, 0));
		that.objectStore.add(new LevelObj( 80, 182, 3));
		that.objectStore.add(new LevelObj( 80, 182, 1));
		that.objectStore.add(new LevelObj(100, 182, 3));
		that.objectStore.add(new LevelObj(120, 182, 2));
		that.objectStore.add(new LevelObj(140, 182, 2));
		that.objectStore.add(new LevelObj(160, 182, 0));
		
		that.objectStore.add(new LevelObj( 40, 200, 0));
		that.objectStore.add(new LevelObj( 60, 200, 0));
		that.objectStore.add(new LevelObj( 80, 200, 3));
		that.objectStore.add(new LevelObj( 80, 200, 1));
		that.objectStore.add(new LevelObj(100, 200, 3));
		that.objectStore.add(new LevelObj(120, 200, 2));
		that.objectStore.add(new LevelObj(140, 200, 4));
		that.objectStore.add(new LevelObj(160, 200, 0));
		
		that.objectStore.add(new LevelObj( 40, 218, 0));
		that.objectStore.add(new LevelObj( 60, 218, 0));
		that.objectStore.add(new LevelObj( 80, 218, 3));
		that.objectStore.add(new LevelObj( 80, 218, 1));
		that.objectStore.add(new LevelObj(100, 218, 3));
		that.objectStore.add(new LevelObj(100, 218, 1));
		that.objectStore.add(new LevelObj(120, 218, 2));
		that.objectStore.add(new LevelObj(140, 218, 2));
		that.objectStore.add(new LevelObj(160, 218, 0));
		
		that.objectStore.add(new LevelObj( 40, 236, 0));
		that.objectStore.add(new LevelObj( 60, 236, 0));
		that.objectStore.add(new LevelObj( 80, 236, 0));
		that.objectStore.add(new LevelObj(100, 236, 0));
		that.objectStore.add(new LevelObj(120, 236, 0));
		that.objectStore.add(new LevelObj(140, 236, 0));
		that.objectStore.add(new LevelObj(160, 236, 0));
		
		that.objectStore.add(new PlayerObj(120, 200));
		
//		that.objectStore.add(new DialogBox(160, 254, 0));
		
		window.addEventListener('resize', that.onResize.bind(that));
		
		that.onResize();
		
		window.setInterval(that.renderFrame.bind(that), 1000 / 6);
	}
	
	return o;
})();

window.addEventListener('load', G.init.bind(G));
