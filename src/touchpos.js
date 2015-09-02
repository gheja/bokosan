"use strict";

/**
 * @constructor
 * @param {InputHandler} inputHandler
 *
 * Why not Touch? Because: "ERROR - Variable Touch first declared in externs.zip//iphone.js"
 */
var TouchPos = function(inputHandler, leftRightTreshold, upDownTreshold)
{
	this.inputHandler = inputHandler;
	this.startX = 0;
	this.startY = 0;
	this.currentX = 0;
	this.currentY = 0;
	this.leftRightTreshold = leftRightTreshold;
	this.upDownTreshold = upDownTreshold;
	this.touchMode = TOUCH_MODE_CANCEL;
}

TouchPos.prototype.handleDirection = function()
{
	var dx, dy;
	
	dx = this.currentX - this.startX;
	dy = this.currentY - this.startY;
	
	if (dy < 0 && dy < -TOUCH_TRESHOLD)
	{
		// up
		// we skip the IH_KEY_STATUS_PRESSED here
		this.inputHandler.setKeyStatus(38, -1, IH_KEY_STAUTS_RELEASED);
	}
	else if (dx > 0 && dx > TOUCH_TRESHOLD)
	{
		// right
		// we skip the IH_KEY_STATUS_PRESSED here
		this.inputHandler.setKeyStatus(39, -1, IH_KEY_STAUTS_RELEASED);
	}
	else if (dy > 0 && dy > TOUCH_TRESHOLD)
	{
		// down
		// we skip the IH_KEY_STATUS_PRESSED here
		this.inputHandler.setKeyStatus(40, -1, IH_KEY_STAUTS_RELEASED);
	}
	else if (dx < 0 && dx < -TOUCH_TRESHOLD)
	{
		// left
		// we skip the IH_KEY_STATUS_PRESSED here
		this.inputHandler.setKeyStatus(37, -1, IH_KEY_STAUTS_RELEASED);
	}
	else
	{
		return;
	}
	
	this.startX = this.currentX;
	this.startY = this.currentY;
}

TouchPos.prototype.start = function(x, y)
{
	this.startX = x;
	this.startY = y;
	
	// just to let it know we had a touch
	this.inputHandler.onTouch();
	
	if (x < this.leftRightTreshold)
	{
		if (y < this.upDownTreshold)
		{
			this.touchMode = TOUCH_MODE_CANCEL;
			this.inputHandler.setKeyStatus(27, -1, IH_KEY_STAUTS_PRESSED);
		}
		else
		{
			this.touchMode = TOUCH_MODE_ACTION;
			this.inputHandler.setKeyStatus(16, -1, IH_KEY_STAUTS_PRESSED);
		}
	}
	else
	{
		this.touchMode = TOUCH_MODE_MOVE;
	}
}

TouchPos.prototype.move = function(x, y)
{
	this.currentX = x;
	this.currentY = y;
	
	if (this.touchMode == TOUCH_MODE_MOVE)
	{
		this.handleDirection();
	}
}

TouchPos.prototype.end = function()
{
	if (this.touchMode == TOUCH_MODE_CANCEL)
	{
		// cancel
		this.inputHandler.setKeyStatus(27, IH_KEY_STAUTS_PRESSED, IH_KEY_STAUTS_RELEASED);
	}
	else if (this.touchMode == TOUCH_MODE_ACTION)
	{
		// action
		this.inputHandler.setKeyStatus(16, IH_KEY_STAUTS_PRESSED, IH_KEY_STAUTS_RELEASED);
	}
}
