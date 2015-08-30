"use strict";

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
			this.x = this.moveFinalX;
			this.y = this.moveFinalY;
			this.tryStop();
		}
	}
}

Obj.prototype.tick = function()
{
	this.tickCount++;
	this.moveIfNeeded();
}
