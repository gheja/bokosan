"use strict";

/**
 * @constructor
 */
var Game = function()
{
	// this.r = null;
	// this.q = null;
	// this.d = null;
	// this.c = null;
	// this.a = null;
	// this.s = null; // == window.localStorage
	/** @type {Menu} */ this.currentMenu = null;
	/** @type {PlayerObj} */ this.player = null;
	this.currentChallenge = null;
	this.currentChallengeId = null;
	/** @type {Screen} */ this.currentScreen = null;
	this.currentLevel = null;
	this.inputHandler = null;
	this.touchHandler = null;
	this.synth = null;
	this.socket = null;
	this.gameMode = 0;
	this.levelPadX = 0;
	this.levelPadY = 0;
	this.ticks = 0;
	this.pixelRatio = 0;
	this.zoomLevel = 0;
	this.fadePercent = 0; // 0: faded/black ... 100: clear/game screen
	this.waitingForKeypress = 0;
	this.currentChallengeMoves = 0;
	this.currentChallengeLevelIndex = 0;
	this.currentLevelIndex = 0;
	this.nextLevelIndex = 0;
	this.serverStatsTime = 0;
	this.fadeMode = FADE_MODE_NONE;
	this.isOffline = 1;
	this.musicEnabled = 1;
	this.soundEnabled = 1;
	/** @type {Array<Obj>} */ this.objects = [];
	this.challengeScores = [];
	this.currentStats = [
		0, // STAT_FRAMES
		0, // STAT_MOVES
		0, // STAT_PULLS
		0, // STAT_LEVELS_STARTED
		0  // STAT_LEVELS_FINISHED
	];
	/** @type {Array<Menu>} */this.menus = [
		// MENU_MAIN
		new Menu(this, [
			[ "PLAY", ACTION_OPEN_MENU, MENU_PLAY ],
			[ "OPTIONS", ACTION_OPEN_MENU, MENU_OPTIONS ],
//			[ "CONTROLS", ACTION_CHANGE_SCREEN, SCREEN_HOWTO ],
			[ "CREDITS", ACTION_CHANGE_SCREEN, SCREEN_ABOUT ]
		]),
		
		// MENU_PLAY
		new Menu(this, [
			[ "SINGLE PLAYER", ACTION_CHANGE_SCREEN, SCREEN_LEVELS ],
			[ "ONLINE CHALLENGE", ACTION_CHANGE_SCREEN, SCREEN_CHALLENGES ],
			[ "CUSTOMIZE", ACTION_OPEN_MENU, MENU_CUSTOMIZE ],
			[ "BACK", ACTION_OPEN_MENU, MENU_MAIN ]
		]),
		
		// MENU_OPTIONS
		new Menu(this, [
			[ "TOGGLE MUSIC", ACTION_CUSTOM, this.toggleMusic.bind(this) ],
			[ "TOGGLE SOUND", ACTION_CUSTOM, this.toggleSound.bind(this) ],
			[ "BACK", ACTION_OPEN_MENU, MENU_MAIN ]
		]),
		
		// MENU_CUSTOMIZE
		new Menu(this, [
			[ "NAME", ACTION_CUSTOM, this.inputPlayerName.bind(this) ],
			[ "HAT COLOR", ACTION_CUSTOM, this.setColor.bind(this, 0) ],
			[ "SHIRT COLOR", ACTION_CUSTOM, this.setColor.bind(this, 1) ],
			[ "PANTS COLOR", ACTION_CUSTOM, this.setColor.bind(this, 2) ],
			[ "BACK", ACTION_OPEN_MENU, MENU_PLAY ]
		])
	];
	/** @type {Array} */ this.levels = _levels;
	/** @type {Array} */ this.challenges = _challenges;
	
	this.screens = [
		new ScreenTitle(),
		new ScreenMenu(),
		new ScreenLevel(),
		new ScreenLevels(),
		new ScreenChallenges(),
		new ScreenAbout()
//		new ScreenHowto()
	];
	
	this.validTextCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,:!?()x<>udr@/-_+*=\"'abc";
	this.serverStatsPrevious = [];
	this.serverStatsLatest = [];
}

Game.prototype.inputPlayerName = function()
{
	var a;
	
	a = window.prompt('New name:' , this.player.name);
	
	if (a != null)
	{
		a = a.toUpperCase().replace(/[^A-Z0-9_@ ]/g, '').trim().substr(0, 10);
		if (a != "")
		{
			this.player.name = a;
			this.setLocalStorageString(STORAGE_PLAYER_NAME, a);
		}
	}
}

Game.prototype.toggleSound = function()
{
	this.soundEnabled = !this.soundEnabled;
}

Game.prototype.toggleMusic = function()
{
	this.musicEnabled = !this.musicEnabled;
}

Game.prototype.fixCanvasContextSmoothing = function(ctx)
{
	ctx.imageSmoothingEnabled = 0;
	ctx.mozImageSmoothingEnabled = 0;
	ctx.webkitImageSmoothingEnabled = 0;
	ctx.msImageSmoothingEnabled = 0;
}

Game.prototype.setWaitForKeypress = function(_nextScreen)
{
	this.waitingForKeypress = 1;
	this.nextScreen = _nextScreen;
}

	// thx David @ http://stackoverflow.com/a/15439809
Game.prototype.isTouchAvailable = function()
{
	return ('ontouchstart' in window) || (navigator.msMaxTouchPoints > 0);
}

Game.prototype.netSend = function(message, data)
{
	try
	{
		this.socket.emit(message, data);
	}
	catch (err)
	{
		// no hard feelings
	}
}

Game.prototype.statSubmit = function(completed)
{
	this.netSend(NET_MESSAGE_PLAYER_STATS, [ this.currentStats, completed ]);
}

Game.prototype.statSubmitChallenge = function()
{
	this.netSend(NET_MESSAGE_PLAYER_CHALLENGE_STATS, [ this.currentChallengeId, this.currentChallengeMoves, this.player.uid, this.player.name, this.player.colors ]);
}

Game.prototype.getServerStats = function()
{
	this.netSend(NET_MESSAGE_GET_SERVER_STATS, 0);
}

Game.prototype.statReset = function()
{
	this.currentStats[STAT_FRAMES] = 0;
	this.currentStats[STAT_MOVES] = 0;
	this.currentStats[STAT_PULLS] = 0;
}

Game.prototype.getLocalStorageString = function(key, defaultValue)
{
	var a;
	
	a = this.s.getItem(key);
	
	return a !== null ? a : defaultValue;
}

Game.prototype.setLocalStorageString = function(key, value)
{
	this.s.setItem(key, value);
}

Game.prototype.getLocalStorageInt = function(key)
{
	return this.s.getItem(key) * 1;
}

Game.prototype.setLocalStorageInt = function(key, value)
{
	this.s.setItem(key, value);
}

Game.prototype.getLocalStorageArray = function(key, defaultValue)
{
	var a;
	
	a = this.s.getItem(key);
	
	return  a !== null ? a.split(',') : defaultValue;
}

Game.prototype.setLocalStorageArray = function(key, value)
{
	this.s.setItem(key, value.join(','));
}

Game.prototype.saveScoreToLocalStorage = function(key, value)
{
	var a;
	
	a = this.getLocalStorageArray(key, []);
	a.push(value);
	a.sort(function(a, b) { return a - b; });
	a.splice(3, 999);
	this.setLocalStorageArray(key, a);
}

Game.prototype.saveScores = function()
{
	this.saveScoreToLocalStorage(STORAGE_HIGHSCORES_TIME_PREFIX + this.currentLevelIndex, this.currentStats[STAT_FRAMES]);
	this.saveScoreToLocalStorage(STORAGE_HIGHSCORES_MOVES_PREFIX + this.currentLevelIndex, this.currentStats[STAT_MOVES]);
	this.saveScoreToLocalStorage(STORAGE_HIGHSCORES_PULLS_PREFIX + this.currentLevelIndex, this.currentStats[STAT_PULLS]);
}

Game.prototype.getScores = function(index)
{
	return [
		this.getLocalStorageArray(STORAGE_HIGHSCORES_TIME_PREFIX + index, []),
		this.getLocalStorageArray(STORAGE_HIGHSCORES_MOVES_PREFIX + index, []),
		this.getLocalStorageArray(STORAGE_HIGHSCORES_PULLS_PREFIX + index, [])
	]
}

Game.prototype.statGetValue = function(statKey)
{
	return this.getLocalStorageInt(STORAGE_STATS_PREFIX + statKey);
}

Game.prototype.statIncrease = function(statKey)
{
	this.currentStats[statKey]++;
	
	this.setLocalStorageInt(STORAGE_STATS_PREFIX + statKey, this.statGetValue(statKey) + 1);
}

Game.prototype.replaceColor = function(ctx, x, y, w, h, c1, c2)
{
	var d, i, j;
	
	d = ctx.getImageData(x, y, w, h);
	
	for (i=0; i<d.data.length; i+= 4)
	{
		if (d.data[i] == c1[0] && d.data[i+1] == c1[1] && d.data[i+2] == c1[2])
		{
			d.data[i] = c2[0];
			d.data[i+1] = c2[1];
			d.data[i+2] = c2[2];
		}
	}
	
	ctx.putImageData(d, x, y);
}

Game.prototype.drawImageAdvanced = function(sx, sy, sw, sh, dx, dy, dw, dh, rotated, mirrored, colors)
{
	var sctx, dctx;
	
	sctx = this.a;
	dctx = this.c;
	
	dctx.save();
	dctx.translate(dx, dy);
	dctx.translate(dw / 2, dh / 2);
	if (rotated)
	{
		dctx.rotate(- Math.PI / 2);
	}
	if (mirrored)
	{
		dctx.scale(-1, 1);
	}
	dctx.drawImage(sctx, sx, sy, sw, sh, - dw / 2, - dh / 2, dw, dh);
	dctx.restore();
	
	if (colors)
	{
		this.replaceColor(dctx, dx, dy, dw, dh, [ 200, 200, 20 ], colors[0]);
		this.replaceColor(dctx, dx, dy, dw, dh, [ 200, 200, 120 ], colors[1]);
		this.replaceColor(dctx, dx, dy, dw, dh, [ 200, 200, 220 ], colors[2]);
	}
}

Game.prototype.drawText = function(posX, posY, content, scale)
{
	var i, x, y, index;
	
	x = 0;
	y = 0;
	
	for (i=0; i<content.length; i++)
	{
		if (content[i] == "\n")
		{
			x = 0;
			y++;
			continue;
		}
		
		index = this.validTextCharacters.indexOf(content[i]);
		
		if (index == -1)
		{
			continue;
		}
		
		this.c.drawImage(this.a, index * 7, 0, 7, 10, posX + x * 8 * scale, posY + y * 10 * scale, 7 * scale, 10 * scale);
		
		x++;
	}
}

Game.prototype.drawSmallText = function(posX, posY, content)
{
	this.drawText(posX, posY, content, 1);
}

Game.prototype.drawSmallTextBlinking = function(posX, posY, content)
{
	if (~~(this.ticks / 6) % 2 == 1)
	{
		this.drawText(posX, posY, content, 1);
	}
}

Game.prototype.drawBigText = function(posX, posY, content)
{
	this.drawText(posX, posY, content, 2);
}

Game.prototype.drawTile = function(posX, posY, tileNumber, rotated, mirrored, floorOnly, colors)
{
	if (!floorOnly)
	{
		this.c.drawImage(this.a, tileNumber * 28, 11, 27, 25, posX, posY, 27, 25);
	}
	else
	{
		this.drawImageAdvanced(tileNumber * 28 + 7, 11 + 7, 20, 18, posX + 7, posY + 7, 20, 18, rotated, mirrored, colors);
	}
}

Game.prototype.drawTouchToContinue = function(x, y)
{
	this.drawSmallTextBlinking(x, y, this.isTouchAvailable() ? "TOUCH ANYWHERE TO CONTINUE" : "  PRESS A KEY TO CONTINUE");
}

Game.prototype.drawHeader = function()
{
	this.drawBigText(0, 0, "BOKOSAN");
	this.drawSmallText(0, 20, "FOR JS13KGAMES 2015");
}

Game.prototype.setColor = function(index)
{
	this.player.colors[index] = [ ~~(Math.random() * 5) * 63, ~~(Math.random() * 5) * 63, ~~(Math.random() * 5) * 63 ];
	this.setLocalStorageArray(STORAGE_PLAYER_COLOR_PREFIX + index, this.player.colors[index]);
}

Game.prototype.onResize = function()
{
	var scale, w, h, tmp;
	
	tmp = this.zoomLevel;
	
	this.zoomLevel = Math.max(Math.min(~~(window.innerWidth / WIDTH), ~~(window.innerHeight / HEIGHT)), 0.5);
	
	
	if (this.zoomLevel * this.pixelRatio < 1)
	{
		this.zoomLevel = 1;
		
		// warn the user about viewport clipping
	}
	
/*
	if (this.zoomLevel < 2 && window.innerWidth < window.innerHeight)
	{
		// suggest the use of landscape mode
	}
*/
	
	w = WIDTH * this.zoomLevel;
	h = HEIGHT * this.zoomLevel;
	
	// I just _really_ love the hiDPI display hacks...
	this.r.width = w * this.pixelRatio;
	this.r.height = h * this.pixelRatio;
	
	// these are reset to 1 on resize
	this.fixCanvasContextSmoothing(this.q);
	
	this.r.style.width = w;
	this.r.style.height = h;
	
	this.r.style.left = (window.innerWidth - w) / 2;
	this.r.style.top = (window.innerHeight - h) / 2;
	
}

Game.prototype.playMenuMusic = function()
{
	this.synth.playSong(3);
}

Game.prototype.playLevelMusic = function()
{
	this.synth.playSong(this.currentLevelIndex % _songs.length);
}

Game.prototype.loadLevel = function()
{
	var x, y, a, b;
	
	this.statReset();
	this.statIncrease(STAT_LEVELS_STARTED);
	
	this.currentLevelIndex = this.nextLevelIndex;
	this.nextLevelIndex = null;
	this.currentLevel = this.levels[this.currentLevelIndex];
	
	this.levelPadX = ~~((WIDTH - this.currentLevel[LEVEL_DATA_WIDTH] * 20 - 10) / 2);
	this.levelPadY = ~~((HEIGHT - this.currentLevel[LEVEL_DATA_HEIGHT] * 18 - 27) / 2);
	
	this.objects.length = 0;
	this.objects.push(this.player);
	
	for (y=0; y<this.currentLevel[LEVEL_DATA_HEIGHT]; y++)
	{
		for (x=0; x<this.currentLevel[LEVEL_DATA_WIDTH]; x++)
		{
			a = x * 20;
			b = y * 18;
			
			switch (this.currentLevel[LEVEL_DATA_TILES][y * this.currentLevel[LEVEL_DATA_WIDTH] + x])
			{
				case "P": // the player
					this.player.x = a;
					this.player.y = b;
				break;
				
				case "B": // a box
				case "E": // a box (above the spike)
					this.objects.push(new BoxObj(this, a, b));
				break;
			}
		}
	}
	this.player.reset();
	
	game.playLevelMusic();
}

Game.prototype.isLevelFinished = function()
{
	var i;
	
	if (this.player.moveStepLeft != 0)
	{
		return 0;
	}
	
	for (i in this.objects)
	{
		if (this.objects[i] instanceof BoxObj && (this.objects[i].getNeighbourTile(0, 0) != '.' && this.objects[i].getNeighbourTile(0, 0) != 'P'))
		{
			return 0;
		}
	}
	
	return 1;
}

Game.prototype.screenFadeAndSwitch = function(_new_screen)
{
	this.nextScreen = _new_screen;
	this.fadeMode = FADE_MODE_OUT;
}

Game.prototype.openMenu = function(id)
{
	this.currentMenu = this.menus[id];
	this.currentMenu.selection = 0;
	this.playMenuMusic();
}

Game.prototype.switchScreen = function(_new_screen)
{
	this.currentScreen = this.screens[_new_screen];
	this.currentScreen.init(this);
	this.inputHandler.clearKeys();
}

Game.prototype.fadeTick = function()
{
	if (this.fadeMode == FADE_MODE_NONE)
	{
		return;
	}
	
	if (this.fadeMode == FADE_MODE_OUT && this.fadePercent == 0)
	{
		this.switchScreen(this.nextScreen);
		this.fadeMode = FADE_MODE_IN;
	}
	
	this.fadePercent = Math.min(Math.max(this.fadePercent += (this.fadeMode == FADE_MODE_IN) ? 34 : -34, 0), 100);
	
	if (this.fadePercent == 100)
	{
		this.fadeMode = FADE_MODE_NONE;
	}
}

Game.prototype.fadeApply = function(ctx, percent)
{
	ctx.fillStyle = "rgba(85,85,85," + (1 - percent / 100) + ")";
	ctx.fillRect(0, 0, this.d.width, this.d.height);
}

Game.prototype.redraw = function()
{
	this.fadeTick();
	
	if (this.fadeMode == FADE_MODE_NONE)
	{
		this.ticks++;
		
		if (this.waitingForKeypress)
		{
			if (this.inputHandler.checkIfKeyPressedAndClear())
			{
				this.fadeMode = FADE_MODE_OUT;
				this.waitingForKeypress = 0;
				this.synth.playSound(SOUND_NEXT);
			}
		}
		
		this.currentScreen.tick(this);
	}
	
	this.c.fillStyle = "#555";
	this.c.fillRect(0, 0, WIDTH, HEIGHT);
	
	this.currentScreen.draw(this);
	
	this.fadeApply(this.c, this.fadePercent);
	
	this.q.drawImage(this.d, 0, 0, WIDTH, HEIGHT, 0, 0, WIDTH * this.pixelRatio * this.zoomLevel, HEIGHT * this.pixelRatio * this.zoomLevel);
}


Game.prototype.renderFrame = function()
{
	this.redraw();
}

Game.prototype.onServerStats = function(data)
{
	this.isOffline = 0;
	this.serverStatsTime = (new Date()).getTime();
	this.serverStatsPrevious = data[0];
	this.serverStatsLatest = data[1];
}

Game.prototype.onServerChallengeStats = function(data)
{
	this.challengeScores = data;
}

Game.prototype.init = function(window)
{
	var i, j, a, dpr, bsr;
	
	this.r = document.getElementById("c");
	this.q = this.r.getContext("2d");
	
	// I love the hiDPI display hacks
	dpr = window.devicePixelRatio || 1;
	
	bsr = this.q.webkitBackingStorePixelRatio ||
		this.q.mozBackingStorePixelRatio ||
		this.q.msBackingStorePixelRatio ||
		this.q.oBackingStorePixelRatio ||
		this.q.backingStorePixelRatio || 1;
	
	this.pixelRatio = dpr / bsr;
	
	this.d = document.createElement('canvas');
	this.d.width = WIDTH;
	this.d.height = HEIGHT;
	
	this.c = this.d.getContext("2d");
	this.fixCanvasContextSmoothing(this.c);
	
	this.s = window.localStorage;
	
	try
	{
		this.socket = io(document.location.href);
		this.socket.on(NET_MESSAGE_SERVER_STATS, this.onServerStats.bind(this));
		this.socket.on(NET_MESSAGE_SERVER_CHALLENGE_STATS, this.onServerChallengeStats.bind(this));
		window.setInterval(this.getServerStats.bind(this), 60000);
		this.getServerStats();
	}
	catch (err)
	{
		// no hard feelings
	}
	
	this.player = new PlayerObj(this, 0, 0);
	if (!this.player.uid)
	{
		this.player.uid = ~~(Math.random() * 1000000);
		this.player.name = "BOB " + _pad(this.player.uid, 6, '0');
		this.setLocalStorageInt(STORAGE_PLAYER_UID, this.player.uid);
		this.setLocalStorageString(STORAGE_PLAYER_NAME, this.player.name);
		this.netSend(NET_MESSAGE_NEW_BOB, 0);
	}
	
	this.a = new Image();
	this.a.src = "./tileset.png";
	
	this.inputHandler = new InputHandler(window);
	this.touchHandler = new TouchHandler(this.inputHandler, 100, 100, window);
	
	this.switchScreen(SCREEN_TITLE);
	this.fadeMode = FADE_MODE_IN;
	this.fadePercent = 0;
	
	this.synth = new Synth(this);
	this.synth.addSamples(_sound_samples);
	this.synth.setSongs(_songs);
	
	window.addEventListener('resize', this.onResize.bind(this));
	this.onResize();
	window.setInterval(this.renderFrame.bind(this), 1000 / 12);

	this.setWaitForKeypress(SCREEN_MENU);
}
