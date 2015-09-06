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
	this.animationFrameNumber = 0;
}

Obj.prototype.draw = function()
{
	this.game.drawTile(this.x + this.game.levelPadX, this.y + this.game.levelPadY, this.tileNumber, this.tileRotated, this.tileMirrored, this.floorOnly);
	this.renderNeeded = false;
}

Obj.prototype.tryStop = function()
{
	this.status = OBJ_STATUS_STANDING;
}

Obj.prototype.getNeighbourTile = function(dx, dy)
{
	var p;
	
	p = (Math.floor(this.y / 18) + dy) * this.game.currentLevel[LEVEL_DATA_WIDTH] + (Math.floor(this.x / 20) + dx);
	
	return this.game.currentLevel[LEVEL_DATA_TILES][p];
},

Obj.prototype.getNeighbourBox = function(dx, dy)
{
	var i;
	
	for (i in this.game.objects)
	{
		if (this.game.objects[i] instanceof BoxObj && this.game.objects[i].x == this.x + dx * 20 && this.game.objects[i].y == this.y + dy * 18)
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

Obj.prototype.setStatus = function(newStatus)
{
	this.status = newStatus;
	this.animationFrameNumber = 0;
}
