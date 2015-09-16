"use strict";

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
	
	for (i=0; i<this.keys.length; i++)
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

InputHandler.prototype.isKeyActive = function(key)
{
	if (this.keys[key].status == IH_KEY_STAUTS_PRESSED || this.keys[key].status == IH_KEY_STAUTS_RELEASED)
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

InputHandler.prototype.onTouch = function()
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
	
	this.clearKeys();
}
