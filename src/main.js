'use strict';

/** @const @type {number} */ var WIDTH = 420;
/** @const @type {number} */ var HEIGHT = 280;

/** @const @type {number} */ var FADE_MODE_NONE = 0;
/** @const @type {number} */ var FADE_MODE_IN = 1;
/** @const @type {number} */ var FADE_MODE_OUT = 2;

/** @const @type {number} */ var SCREEN_INTRO = 0;
/** @const @type {number} */ var SCREEN_MENU = 1;
/** @const @type {number} */ var SCREEN_HIGHSCORE = 2;
/** @const @type {number} */ var SCREEN_DIALOG_HELLO = 3;
/** @const @type {number} */ var SCREEN_DIALOG_FAIL1 = 4;
/** @const @type {number} */ var SCREEN_DIALOG_FAIL2 = 5;
/** @const @type {number} */ var SCREEN_GAME = 6;

// Obj orientations
/** @const @type {number} */ var OBJ_ORIENTATION_NORTH = 0;
/** @const @type {number} */ var OBJ_ORIENTATION_EAST = 1;
/** @const @type {number} */ var OBJ_ORIENTATION_SOUTH = 2;
/** @const @type {number} */ var OBJ_ORIENTATION_WEST = 3;

// Obj animation state
/** @const @type {number} */ var OBJ_STATUS_STANDING = 0;
/** @const @type {number} */ var OBJ_STATUS_WALKING = 1;
/** @const @type {number} */ var OBJ_STATUS_GRAB = 2;
/** @const @type {number} */ var OBJ_STATUS_PULLING = 3;
/** @const @type {number} */ var OBJ_STATUS_FALLING = 4;

// InputHandler
/** @const @type {number} */ var IH_KEY_UP = 0;
/** @const @type {number} */ var IH_KEY_RIGHT = 1;
/** @const @type {number} */ var IH_KEY_DOWN = 2;
/** @const @type {number} */ var IH_KEY_LEFT = 3;
/** @const @type {number} */ var IH_KEY_ACTION = 4;
/** @const @type {number} */ var IH_KEY_CANCEL = 5;

/** @const @type {number} */ var IH_KEY_STAUTS_RESET = 0;
/** @const @type {number} */ var IH_KEY_STAUTS_PRESSED = 1;
/** @const @type {number} */ var IH_KEY_STAUTS_RELEASED = 2;



/** @constructor */
var Obj = function(game, x, y)
{
	// notice: must be ordered from 0..3
	this.oppositeOrientations = [ OBJ_ORIENTATION_SOUTH, OBJ_ORIENTATION_WEST, OBJ_ORIENTATION_NORTH, OBJ_ORIENTATION_EAST ];
	
	this.game = game;
	this.x = x;
	this.y = y;
	this.moveStepX = 0;
	this.moveStepY = 0;
	this.moveStepLeft = 0;
	this.renderNeeded = false;
	this.renderOrder = 0;
	this.tickCount = 0;
	this.tileNumber = 0;
	this.tileRotated = 0;
	this.tileMirrored = 0;
	this.floorOnly = false;
	this.orientation = OBJ_ORIENTATION_NORTH;
	this.status = OBJ_STATUS_STANDING;
	this.isBox = false;
}

Obj.prototype.draw = function()
{
	this.game.drawTile(this.x, this.y, this.tileNumber, this.tileRotated, this.tileMirrored, this.floorOnly);
	this.renderNeeded = false;
}

Obj.prototype.setPosition = function(x, y)
{
	this.x = x;
	this.y = y;
}

Obj.prototype.getPosition = function()
{
	return [ this.x, this.y ];
}

Obj.prototype.setRenderNeeded = function(value)
{
	this.renderNeeded = value;
}

Obj.prototype.getRenderNeeded = function()
{
	return this.renderNeeded;
}

Obj.prototype.updateRenderOrder = function()
{
	this.renderOrder = this.y * WIDTH + this.x;
}

Obj.prototype.getRenderOrder = function()
{
	return this.renderOrder;
}

Obj.prototype.tryStop = function()
{
	this.status = OBJ_STATUS_STANDING;
}

Obj.prototype.getNeighbourTile = function(dx, dy)
{
	var p;
	
	p = (Math.floor(this.y / 18) + dy) * this.game.currentLevelWidth + (Math.floor(this.x / 20) + dx);
	
	return this.game.currentLevel[p];
},

Obj.prototype.getNeighbourBox = function(dx, dy)
{
	var i;
	
	for (i in this.game.objects)
	{
		// instanceof not working
		if (this.game.objects[i].isBox && this.game.objects[i].x == this.x + dx * 20 && this.game.objects[i].y == this.y + dy * 18)
		{
			return this.game.objects[i];
		}
	}
	
	return null;
},

Obj.prototype.moveIfNeeded = function()
{
	if (this.moveStepLeft > 0)
	{
		this.x += this.moveStepX;
		this.y += this.moveStepY;
		
		this.moveStepLeft--;
		
		if (this.moveStepLeft == 0)
		{
			this.moveStepX = 0;
			this.moveStepY = 0;
			this.tryStop();
		}
	}
}

Obj.prototype.tick = function()
{
	this.tickCount++;
	this.moveIfNeeded();
}



/**
 * @constructor
 * @extends {Obj}
 * @param {Game} game
 * @param {number} x
 * @param {number} y
 */
var BoxObj = function(game, x, y)
{
	this.game = game;
	this.x = x;
	this.y = y;
	this.tileNumber = 1;
	this.isBox = true;
}

BoxObj.prototype = new Obj(0, 0, 0);



/**
 * @constructor
 * @extends {Obj}
 * @param {Game} game
 * @param {number} x
 * @param {number} y
 */
var PlayerObj = function(game, x, y)
{
	this.game = game;
	this.x = x;
	this.y = y;
	this.tileNumber = 6;
	this.floorOnly = true;
	this.grabbedBox = null;
	
	// [ 0: "rotated?", 1: [ 0: [ 0: "tile", 1: "mirrored?" ], 1: ... ]
	this.animations = [
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
	this.animationFramesLeft = 0;
}

PlayerObj.prototype = new Obj(0, 0, 0);

PlayerObj.prototype.tick = function()
{
	var a, b;
	
	this.tickCount++;
	this.moveIfNeeded();
	
	if (this.status != OBJ_STATUS_FALLING)
	{
		a = this.orientation * 4 + this.status;
	}
	else
	{
		a = 16;
	}
	
	b = this.tickCount % this.animations[a][1].length;
	
	this.tileNumber = this.animations[a][1][b][0];
	this.tileRotated = this.animations[a][0];
	this.tileMirrored = this.animations[a][1][b][1];
}

PlayerObj.prototype.checkCollisionAndGo = function(dx, dy, steps)
{
	if (this.getNeighbourTile(dx, dy) == 'w' || this.getNeighbourBox(dx, dy) !== null)
	{
		return;
	}
	
	this.moveStepX = dx * 2;
	this.moveStepY = dy * 2;
	this.moveStepLeft = steps;
	
	if (this.status == OBJ_STATUS_GRAB)
	{
		// copy the movement to the box
		this.grabbedBox.moveStepX = this.moveStepX;
		this.grabbedBox.moveStepY = this.moveStepY;
		this.grabbedBox.moveStepLeft = this.moveStepLeft;
		
		this.status = OBJ_STATUS_PULLING;
	}
	else
	{
		this.status = OBJ_STATUS_WALKING;
	}
}

PlayerObj.prototype.tryWalk = function(orientation)
{
	if (this.moveStepLeft != 0)
	{
		return;
	}
	
	// when a box is grabbed the player can only move backwards
	if (this.grabbedBox !== null && orientation != this.oppositeOrientations[this.orientation])
	{
		return;
	}
	
	// the orientation can only be changed if no box is grabbed
	if (this.grabbedBox === null)
	{
		this.orientation = orientation;
	}
	
	switch (orientation)
	{
		case OBJ_ORIENTATION_NORTH:
			this.checkCollisionAndGo(0, -1, 9);
		break;
		
		case OBJ_ORIENTATION_EAST:
			this.checkCollisionAndGo(1, 0, 10);
		break;
		
		case OBJ_ORIENTATION_SOUTH:
			this.checkCollisionAndGo(0, 1, 9);
		break;
		
		case OBJ_ORIENTATION_WEST:
			this.checkCollisionAndGo(-1, 0, 10);
		break;
	}
}

PlayerObj.prototype.tryStop = function()
{
	if (this.grabbedBox === null)
	{
		this.status = OBJ_STATUS_STANDING;
	}
	else
	{
		this.status = OBJ_STATUS_GRAB;
	}
}

PlayerObj.prototype.tryGrab = function()
{
	var box;
	
	if (this.grabbedBox !== null)
	{
		return;
	}
	
	switch (this.orientation)
	{
		case OBJ_ORIENTATION_NORTH:
			box = this.getNeighbourBox(0, -1);
		break;
		
		case OBJ_ORIENTATION_EAST:
			box = this.getNeighbourBox(1, 0);
		break;
		
		case OBJ_ORIENTATION_SOUTH:
			box = this.getNeighbourBox(0, 1);
		break;
		
		case OBJ_ORIENTATION_WEST:
			box = this.getNeighbourBox(-1, 0);
		break;
	}
	
	if (box == null)
	{
		return;
	}
	
	this.grabbedBox = box;
	this.status = OBJ_STATUS_GRAB;
}

PlayerObj.prototype.tryRelease = function()
{
	this.status = OBJ_STATUS_STANDING;
	this.grabbedBox = null;
}

PlayerObj.prototype.isStuck = function()
{
	if (this.moveStepLeft != 0 ||
		(this.getNeighbourTile( 0, -1) != 'w' && this.getNeighbourBox( 0, -1) === null) ||
		(this.getNeighbourTile( 1,  0) != 'w' && this.getNeighbourBox( 1,  0) === null) ||
		(this.getNeighbourTile( 0,  1) != 'w' && this.getNeighbourBox( 0,  1) === null) ||
		(this.getNeighbourTile(-1,  0) != 'w' && this.getNeighbourBox(-1,  0) === null)
	)
	{
		return false;
	}
	
	return true;
}



/**
 * @constructor
 */
var InputHandler = function(obj)
{
	this.keyPressed = false;
	this.keys = [
		{ keyCodes: [ 38, 87 ], status: IH_KEY_STAUTS_RESET }, // IH_KEY_UP
		{ keyCodes: [ 39, 68 ], status: IH_KEY_STAUTS_RESET }, // IH_KEY_RIGHT
		{ keyCodes: [ 40, 83 ], status: IH_KEY_STAUTS_RESET }, // IH_KEY_DOWN
		{ keyCodes: [ 37, 65 ], status: IH_KEY_STAUTS_RESET }, // IH_KEY_LEFT
		{ keyCodes: [ 16, 32, 13 ], status: IH_KEY_STAUTS_RESET }, // IH_KEY_ACTION
		{ keyCodes: [ 27 ], status: IH_KEY_STAUTS_RESET } // IH_KEY_CANCEL
	];
	
	this.bind(obj);
}

InputHandler.prototype.setKeyStatus = function(keyCode, statusFrom, statusTo)
{
	var i, j;
	
	// if keyCode == -1 then set status for all keys
	
	for (i in this.keys)
	{
		for (j=0; j<this.keys[i].keyCodes.length; j++)
		{
			if (this.keys[i].keyCodes[j] == keyCode || keyCode == -1)
			{
				if (this.keys[i].status == statusFrom || statusFrom == -1)
				{
					this.keys[i].status = statusTo;
				}
				
				// no return here as the case keyCode == -1 needs to update all keys
				break;
			}
		}
	}
/*
	var s;
	s = "";
	for (i in  this.keys)
	{
		s += "[" + i + ": " + this.keys[i].status + "] ";
	}
	console.log(s);
*/
}

InputHandler.prototype.isKeyStatus = function(key, status)
{
	if (this.keys[key].status == status)
	{
		return true;
	}
	else
	{
		return false;
	}
}

InputHandler.prototype.onKeyDown = function(e)
{
	var keyCode;
	
	keyCode = e.which ? e.which : e.keyCode;
	
	this.setKeyStatus(keyCode, -1, IH_KEY_STAUTS_PRESSED);
	
	this.keyPressed = true;
}

InputHandler.prototype.onKeyUp = function(e)
{
	var keyCode;
	
	keyCode = e.which ? e.which : e.keyCode;
	
	this.setKeyStatus(keyCode, IH_KEY_STAUTS_PRESSED, IH_KEY_STAUTS_RELEASED);
}

InputHandler.prototype.onTouchStart = function(e)
{
	this.keyPressed = true;
}

InputHandler.prototype.checkIfKeyPressedAndClear = function()
{
	if (this.keyPressed)
	{
		this.keyPressed = false;
		return true;
	}
	
	return false;
}

InputHandler.prototype.clearKeys = function()
{
	this.keyPressed = false;
	this.setKeyStatus(-1, -1, IH_KEY_STAUTS_RESET);
}

InputHandler.prototype.clearReleasedKeys = function()
{
	this.setKeyStatus(-1, IH_KEY_STAUTS_RELEASED, IH_KEY_STAUTS_RESET);
}

InputHandler.prototype.bind = function(w)
{
	w.addEventListener('keydown', this.onKeyDown.bind(this));
	w.addEventListener('keyup', this.onKeyUp.bind(this));
	w.addEventListener('touchstart', this.onTouchStart.bind(this));
	
	this.clearKeys();
}



/**
 * @constructor
 */
var Menu = function(selection, items)
{
	/** @type {number} */ this.selection = selection;
	/** @type {Array} */ this.items = items;
}

Menu.prototype.step = function(direction)
{
	// this.selection = Math.min(Math.max(this.selection + direction, 0), this.items.length - 1);
	
	// ensure that the selection is valid, roll over if necessary
	this.selection = (this.selection + direction + this.items.length) % this.items.length;
}

Menu.prototype.go = function()
{
	this.items[this.selection][1]();
}



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
	this.objectStore = null;
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
			this.waitingForKeypress = true;
			this.nextScreen = SCREEN_MENU;
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
			if (this.isTouchAvailable)
			{
				this.drawSmallTextBlinking(96, 200, "TOUCH ANYWHERE TO CONTINUE");
			}
			else
			{
				this.drawSmallTextBlinking(104, 200, "PRESS A KEY TO CONTINUE");
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
	
	if (this.currentScreen == SCREEN_MENU)
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

Game.prototype.assetLoadFinished = function()
{
	this._assetLoaded = true;
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

var game = new Game();

window.addEventListener('load', game.init.bind(game, window));
