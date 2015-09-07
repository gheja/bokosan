"use strict";

/**
 * @constructor
 */
var Synth = function()
{
	this.ctx = new (window.AudioContext || window.webkitAudioContext)();
	this.samples = [];
	this.patterns = [];
}

Synth.prototype.addSamples = function(a)
{
	var i, sample;
	
	for (i in a)
	{
		this.samples.push(Jsfxr(this.ctx, a[i]));
	}
}

Synth.prototype.playSound = function(id)
{
	var source = this.ctx.createBufferSource();
	source.connect(this.ctx.destination);
	source.buffer = this.samples[id];
	source.playbackRate.value = 1;
	// source.noteOn(0);
	source.start(0);
}
