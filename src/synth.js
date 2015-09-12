"use strict";

/**
 * @constructor
 */
var Synth = function(game)
{
	this.game = game;
	this.ctx = new (window.AudioContext || window.webkitAudioContext)();
	/** @type {Array<AudioBuffer>} */ this.samples = [];
	/** @type {Array<Array>} */ this.songs = [];
	this.timeout = null;
	/** @type {Array} */ this.currentSong = null;
	this.currentSongBar = 0;
	this.currentSongPatternIndex = 0;
	this.channelSounds = [];
}

Synth.prototype.addSamples = function(a)
{
	var i, sample;
	
	for (i in a)
	{
		this.samples.push(Jsfxr(this.ctx, a[i]));
	}
}

// song:
//   - time between notes (number)
//   - channels (Array)
//     - sample number (number)
//     - sample base note (number, C-4: ...)
//     - notes (Array)
//   - play pattern
//   - play pattern loop start
Synth.prototype.setSongs = function(songs)
{
	this.songs = songs;
}

Synth.prototype.getFrequencyFromNoteNumber = function(note)
{
	var period;
	
	period = 10*12*16*4 - note * 16*4;
	
	return 8363 * Math.pow(2, (6*12*16*4 - period) / (12*16*4));
}

Synth.prototype.playNextBar = function()
{
	var source, i, channels, note;
	
	if (!this.game.musicEnabled)
	{
		return;
	}
	
	channels = this.currentSong[SONG_DATA_CHANNELS];
	
	for (i in channels)
	{
		if (this.currentSong[SONG_DATA_PATTERNS][this.currentSongPatternIndex][i] != 1)
		{
			continue;
		}
		// notes are 1..96 (1 is C-0, 96 is B-7) and 97 which is key off
		note = channels[i][SONG_CHANNEL_DATA_NOTES][this.currentSongBar] || 0;
		
		// empty
		if (note < 1)
		{
			continue;
		}
		
		if (this.channelSounds[i])
		{
			this.channelSounds[i].stop();
		}
		
		// key off
		if (note == 97)
		{
			continue;
		}
		
		source = this.ctx.createBufferSource();
		source.connect(this.ctx.destination);
		source.buffer = this.samples[SOUND_FIRST_SONG_SAMPLE + channels[i][SONG_CHANNEL_DATA_SAMPLE_ID]];
		source.playbackRate.value = this.getFrequencyFromNoteNumber(note) / this.getFrequencyFromNoteNumber(channels[i][SONG_CHANNEL_DATA_BASE_NOTE]);
		source.start(0);
		
		this.channelSounds[i] = source;
	}
	
	this.currentSongBar++
	
	if (this.currentSongBar == channels[0][SONG_CHANNEL_DATA_NOTES].length)
	{
		this.currentSongBar = 0;

		this.currentSongPatternIndex++;
		
		if (this.currentSongPatternIndex == this.currentSong[SONG_DATA_PATTERNS].length)
		{
			this.currentSongPatternIndex = this.currentSong[SONG_DATA_PATTERN_LOOP_START];
		}
	}
}

Synth.prototype.playSound = function(id)
{
	var source;
	
	if (!this.game.soundEnabled)
	{
		return;
	}
	
	source = this.ctx.createBufferSource();
	source.connect(this.ctx.destination);
	source.buffer = this.samples[id];
	source.playbackRate.value = 1;
	source.start(0);
}

Synth.prototype.playSong = function(id)
{
	if (this.currentSong == this.songs[id])
	{
		return;
	}
	
	this.currentSongBar = 0;
	this.currentSongPatternIndex = 0;
	
	this.currentSong = this.songs[id];
	if (this.timeout)
	{
		window.clearTimeout(this.timeout);
	}
	this.timeout = window.setInterval(this.playNextBar.bind(this), this.currentSong[SONG_DATA_INTERVAL]);
}
