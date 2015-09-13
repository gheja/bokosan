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
	this.tileNumber = 13;
	this.floorOnly = 1;
	this.grabbedBox = null;
	this.walkStepSoundCounter = 0;
	
	this.uid = game.getLocalStorageInt(STORAGE_PLAYER_UID);
	this.name = game.getLocalStorageString(STORAGE_PLAYER_NAME);
	this.colors = [
		game.getLocalStorageArray(STORAGE_PLAYER_COLOR_PREFIX + '0', [ 255, 255, 0 ] ),
		game.getLocalStorageArray(STORAGE_PLAYER_COLOR_PREFIX + '1', [ 0, 128, 192 ] ),
		game.getLocalStorageArray(STORAGE_PLAYER_COLOR_PREFIX + '2', [ 255, 128, 0 ] )
	];
	
	
	// [ 0: "rotated?", 1: [ 0: [ 0: "tile", 1: "mirrored?" ], 1: ... ]
	this.animations = [
		[ 0, [ [ 10, 0 ]                                  ] ], //  0: north_standing:
		[ 0, [ [ 11, 0 ], [ 10, 0 ], [ 10, 0 ], [ 11, 1 ], [ 10, 0 ] ] ], //  1: north_walking:
		[ 0, [ [ 12, 0 ]                                  ] ], //  2: north_grab:
		[ 0, [ [ 16, 0 ], [ 12, 1 ], [ 12, 1 ], [ 16, 0 ], [ 12, 0 ] ] ], //  3: north_pulling:
		
		[ 1, [ [ 13, 0 ]                                  ] ], //  4: east_standing:
		[ 1, [ [ 14, 0 ], [ 13, 0 ], [ 14, 1 ], [ 14, 1 ], [ 13, 0 ] ] ], //  5: east_walking:
		[ 1, [ [ 15, 0 ]                                  ] ], //  6: east_grab:
		[ 1, [ [ 17, 0 ], [ 15, 1 ], [ 17, 0 ], [ 17, 0 ], [ 15, 0 ] ] ], //  7: east_pulling:
		
		[ 0, [ [ 13, 0 ]                                  ] ], //  8: south_standing:
		[ 0, [ [ 14, 0 ], [ 13, 0 ], [ 14, 1 ], [ 14, 1 ], [ 13, 0 ] ] ], //  9: south_walking:
		[ 0, [ [ 15, 0 ]                                  ] ], // 10: south_grab:
		[ 0, [ [ 17, 0 ], [ 15, 1 ], [ 17, 0 ], [ 17, 0 ], [ 15, 0 ] ] ], // 11: south_pulling:
		
		[ 1, [ [ 10, 0 ]                                  ] ], // 12: west_standing:
		[ 1, [ [ 11, 0 ], [ 10, 0 ], [ 10, 0 ], [ 11, 1 ], [ 10, 0 ] ] ], // 13: west_walking:
		[ 1, [ [ 12, 0 ]                                  ] ], // 14: west_grab:
		[ 1, [ [ 16, 0 ], [ 12, 1 ], [ 12, 1 ], [ 16, 0 ], [ 12, 0 ] ] ], // 15: west_pulling:
		
		// animation is not playing when screen fade is active - see issue #9
		// [ 0, [ [ 18, 0 ], [ 18, 1 ], [ 19, 0 ], [ 19, 1 ] ] ]  // 16: falling
		
		[ 0, [ [ 18, 0 ]                                  ] ]  // 16: falling 
	];
}

PlayerObj.prototype = new Obj();

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
	
	this.animationFrameNumber++;
	
	b = this.animationFrameNumber % this.animations[a][1].length;
	
	if (this.status == OBJ_STATUS_WALKING || this.status == OBJ_STATUS_PULLING)
	{
		if (this.animationFrameNumber % 2 == 1)
		{
			this.walkStepSoundCounter++;
			
			if (this.walkStepSoundCounter % 2 == 0)
			{
				this.game.synth.playSound(SOUND_STEP1);
			}
			else
			{
				this.game.synth.playSound(SOUND_STEP2);
			}
		}
	}
	
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
		
		this.setStatus(OBJ_STATUS_PULLING);
		this.game.synth.playSound(SOUND_BOX_PULL);
		this.game.statIncrease(STAT_PULLS);
	}
	else
	{
		this.setStatus(OBJ_STATUS_WALKING);
	}
	this.game.currentChallengeMoves++;
	this.game.statIncrease(STAT_MOVES);
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
	this.setStatus(this.grabbedBox === null ? OBJ_STATUS_STANDING : OBJ_STATUS_GRAB);
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
	this.setStatus(OBJ_STATUS_GRAB);
	this.game.synth.playSound(SOUND_BOX_GRAB);
}

PlayerObj.prototype.tryRelease = function()
{
	this.setStatus(OBJ_STATUS_STANDING);
	this.grabbedBox = null;
}

PlayerObj.prototype.isInHole = function()
{
	return (this.moveStepLeft == 0) && ('abcdfgh'.indexOf(this.getNeighbourTile(0, 0)) != -1);
}

PlayerObj.prototype.isOnSpikes = function()
{
	return (this.moveStepLeft == 0 && (this.getNeighbourTile(0, 0) == 'e' || this.getNeighbourTile(0, 0) == 'E'));
}

PlayerObj.prototype.reset = function()
{
	this.status = OBJ_STATUS_STANDING;
	this.orientation = OBJ_ORIENTATION_SOUTH;
	this.grabbedBox = null;
	this.moveStepLeft = 0;
}
