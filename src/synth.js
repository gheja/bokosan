"use strict";

var SynthChannel = function()
{
	this.data = null;
	this.position = 0;
	this.playbackRate = 0;
}

/**
 * @constructor
 */
var Synth = function(game)
{
	var i;
	
	this.game = game;
	this.ctx = new (window.AudioContext || window.webkitAudioContext)();
	/** @type {Array<AudioBuffer>} */ this.samples = [];
	/** @type {Array<Array>} */ this.songs = [];
	/** @type {Array} */ this.currentSong = null;
	this.songBufferPosition = 0;
	this.songCurrentBar = 0;
	this.songCurrentPatternIndex = 0;
	/** @type {Array<SynthChannel>} */ this.songSynthChannels = [];
	
	this.musicNode = this.ctx.createScriptProcessor(1024 * 8, 0, 1);
	this.musicNode.onaudioprocess = this.fillAudioNodeBuffer.bind(this);
	this.musicNode.connect(this.ctx.destination);
	
	this.samplesPerBar = 0; // should be filled using WebAudio data
	this.sampleRatio = 1;
	
	// initialize 24 channels for music
	for (i=0; i<24; i++)
	{
		this.songSynthChannels[i] = new SynthChannel();
	}
}

Synth.prototype.addSamples = function(a)
{
	var i;
	
	for (i in a)
	{
		this.samples.push(Jsfxr(this.ctx, a[i]));
	}
}

// song:
//   - time between notes (number)
//   - channels (Array)
//     - sample number (number)
//     - sample base note (number, C-4: 49)
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

Synth.prototype.fillAudioNodeBuffer = function(e)
{
	var i, j, songChannels, note, buffer, a;
	
	buffer = e.outputBuffer.getChannelData(0);
	
	for (i=0; i<buffer.length; i++)
	{
		buffer[i] = 0;
	}
	
	if (!this.game.musicEnabled || !this.currentSong)
	{
		return;
	}
	
	songChannels = this.currentSong[SONG_DATA_CHANNELS];
	
	for (i=0; i<buffer.length; i++)
	{
		if (this.songBufferPosition % this.samplesPerBar == 0)
		{
			// set up channels using the current notes
			for (j=0; j<songChannels.length; j++)
			{
				if (this.currentSong[SONG_DATA_PATTERNS][this.songCurrentPatternIndex][j] != 1)
				{
					continue;
				}
				
				// notes are 1..96 (1 is C-0, 96 is B-7) and 97 which is key off
				note = songChannels[j][SONG_CHANNEL_DATA_NOTES][this.songCurrentBar] || 0;
				
				// empty
				if (note < 1)
				{
					continue;
				}
				
				// key off
				if (note == 97)
				{
					this.songSynthChannels[j].playbackRate = 0;
					continue;
				}
				
				this.songSynthChannels[j].data = this.samples[SOUND_FIRST_SONG_SAMPLE + songChannels[j][SONG_CHANNEL_DATA_SAMPLE_ID]].rawData;
				this.songSynthChannels[j].position = 0;
				this.songSynthChannels[j].playbackRate = this.getFrequencyFromNoteNumber(note) / this.getFrequencyFromNoteNumber(songChannels[j][SONG_CHANNEL_DATA_BASE_NOTE]) * this.sampleRatio;
				
				// when all channels are fixed to C-4 base note:
				// this.songSynthChannels[j].playbackRate = this.getFrequencyFromNoteNumber(note) / this.getFrequencyFromNoteNumber(49);
			}
			
			this.songCurrentBar++;
			
			if (this.songCurrentBar == songChannels[0][SONG_CHANNEL_DATA_NOTES].length)
			{
				this.songCurrentBar = 0;
				
				this.songCurrentPatternIndex++;
				
				if (this.songCurrentPatternIndex == this.currentSong[SONG_DATA_PATTERNS].length)
				{
					this.songCurrentPatternIndex = this.currentSong[SONG_DATA_PATTERN_LOOP_START];
				}
			}
		}
		
		a = 0;
		
		// do the actual buffer rendering...
		for (j=0; j<this.songSynthChannels.length; j++)
		{
			if (this.songSynthChannels[j].playbackRate != 0)
			{
				a += this.songSynthChannels[j].data[Math.floor(this.songSynthChannels[j].position)];
				
				// playback rate is the rate which we should increase the pointer in the sample
				// per render sample request
				this.songSynthChannels[j].position += this.songSynthChannels[j].playbackRate;
				
				if (this.songSynthChannels[j].position >= this.songSynthChannels[j].data.length)
				{
					this.songSynthChannels[j].playbackRate = 0;
				}
			}
		}
		
		// volume decreased here to prevent clipping
		buffer[i] = a * 0.5;
		
		this.songBufferPosition++;
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
	source.buffer = this.samples[id].buffer;
	source.connect(this.ctx.destination);
	source.start(0);
}

Synth.prototype.playSong = function(id)
{
	if (this.currentSong == this.songs[id])
	{
		return;
	}
	
	this.songBufferPosition = 0;
	this.songCurrentBar = 0;
	this.songCurrentPatternIndex = 0;
	this.currentSong = this.songs[id];
	this.samplesPerBar = this.ctx.sampleRate / (1000 / this.currentSong[SONG_DATA_INTERVAL]);
	this.sampleRatio = 44100 / this.ctx.sampleRate;
}
