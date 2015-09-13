"use strict";

/**
 * @constructor
 */
var InputHandler = function(obj)
{
	this.keyPressed = 0;
	this.keys = [
		{ keyCode: 38, s: IH_KEY_STAUTS_RESET }, // IH_KEY_UP
		{ keyCode: 39, s: IH_KEY_STAUTS_RESET }, // IH_KEY_RIGHT
		{ keyCode: 40, s: IH_KEY_STAUTS_RESET }, // IH_KEY_DOWN
		{ keyCode: 37, s: IH_KEY_STAUTS_RESET }, // IH_KEY_LEFT
		{ keyCode: 16, s: IH_KEY_STAUTS_RESET }, // IH_KEY_ACTION
		{ keyCode: 27, s: IH_KEY_STAUTS_RESET } // IH_KEY_CANCEL
	];
	
	this.bind(obj);
}

InputHandler.prototype.setKeyStatus = function(keyCode, statusFrom, statusTo)
{
	var i, j;
	
	// if keyCode == -1 then set status for all keys
	
	for (i in this.keys)
	{
		if (this.keys[i].keyCode == keyCode || (keyCode == -1))
		{
			if (this.keys[i].s == statusFrom || statusFrom == -1)
			{
				this.keys[i].s = statusTo;
			}
			// no return here as the case keyCode == -1 needs to update all keys
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
	if (this.keys[key].s == status)
	{
		return 1;
	}
	else
	{
		return 0;
	}
}

InputHandler.prototype.isKeyActive = function(key)
{
	if (this.keys[key].s == IH_KEY_STAUTS_PRESSED || this.keys[key].s == IH_KEY_STAUTS_RELEASED)
	{
		return 1;
	}
	else
	{
		return 0;
	}
}

InputHandler.prototype.onKeyDown = function(e)
{
	var keyCode;
	
	keyCode = e.which ? e.which : e.keyCode;
	
	this.setKeyStatus(keyCode, -1, IH_KEY_STAUTS_PRESSED);
	
	this.keyPressed = 1;
}

InputHandler.prototype.onKeyUp = function(e)
{
	var keyCode;
	
	keyCode = e.which ? e.which : e.keyCode;
	
	this.setKeyStatus(keyCode, IH_KEY_STAUTS_PRESSED, IH_KEY_STAUTS_RELEASED);
}

InputHandler.prototype.onTouch = function()
{
	this.keyPressed = 1;
}

InputHandler.prototype.checkIfKeyPressedAndClear = function()
{
	if (this.keyPressed)
	{
		this.keyPressed = 0;
		return 1;
	}
	
	return 0;
}

InputHandler.prototype.clearKeys = function()
{
	this.keyPressed = 0;
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
	
	this.clearKeys();
}
