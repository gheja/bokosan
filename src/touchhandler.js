"use strict";

/**
 * @constructor
 * @param {InputHandler} inputHandler
 * @param {number} leftRightTreshold
 * @param {number} upDownTreshold
 * @param {Object} obj
 */
var TouchHandler = function(inputHandler, leftRightTreshold, upDownTreshold, obj)
{
	var i;
	
	obj.addEventListener("touchstart", this.onTouchStart.bind(this), true);
	obj.addEventListener("touchmove", this.onTouchMove.bind(this), true);
	obj.addEventListener("touchend", this.onTouchEnd.bind(this), true);
	obj.addEventListener("touchcancel", this.onTouchEnd.bind(this), true);
	
	this.touches = [];
	
	for (i=0; i<10; i++)
	{
		this.touches.push(new TouchPos(inputHandler, leftRightTreshold, upDownTreshold));
	}
}

TouchHandler.prototype.onTouchStart = function(event)
{
	var i, t;
	
	for (i=0; i<event.changedTouches.length; i++)
	{
		t = event.changedTouches[i];
		this.touches[t.identifier].start(t.clientX, t.clientY);
	}
	
	event.preventDefault();
}

TouchHandler.prototype.onTouchMove = function(event)
{
	var i, t;
	
	for (i=0; i<event.touches.length; i++)
	{
		t = event.touches[i];
		this.touches[t.identifier].move(t.clientX, t.clientY);
	}
	
	event.preventDefault();
}

TouchHandler.prototype.onTouchEnd = function(event)
{
	var i, t;
	
	for (i=0; i<event.changedTouches.length; i++)
	{
		t = event.changedTouches[i];
		this.touches[t.identifier].end();
	}
	
	event.preventDefault();
}
