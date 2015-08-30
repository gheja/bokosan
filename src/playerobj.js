"use strict";

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

PlayerObj.prototype.checkCollisionAndGo = function(dx, dy, steps, speed, fx, fy)
{
	if (this.getNeighbourTile(dx, dy) == 'w' || this.getNeighbourBox(dx, dy) !== null)
	{
		return;
	}
	
	this.moveStepX = dx * speed;
	this.moveStepY = dy * speed;
	this.moveStepLeft = steps;
	
	this.moveFinalX = this.x + fx;
	this.moveFinalY = this.y + fy;
	
	if (this.status == OBJ_STATUS_GRAB)
	{
		// copy the movement to the box
		this.grabbedBox.moveStepX = this.moveStepX;
		this.grabbedBox.moveStepY = this.moveStepY;
		this.grabbedBox.moveFinalX = this.grabbedBox.x + fx;
		this.grabbedBox.moveFinalY = this.grabbedBox.y + fy;
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
			this.checkCollisionAndGo(0, -1, 6, 3, 0, -18);
		break;
		
		case OBJ_ORIENTATION_EAST:
			this.checkCollisionAndGo(1, 0, 6, 3, 20, 0);
		break;
		
		case OBJ_ORIENTATION_SOUTH:
			this.checkCollisionAndGo(0, 1, 6, 3, 0, 18);
		break;
		
		case OBJ_ORIENTATION_WEST:
			this.checkCollisionAndGo(-1, 0, 6, 3, -20, 0);
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
