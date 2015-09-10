"use strict";

/** @const @type {number} */ var WIDTH = 420;
/** @const @type {number} */ var HEIGHT = 280;

/** @const @type {number} */ var FADE_MODE_NONE = 0;
/** @const @type {number} */ var FADE_MODE_IN = 1;
/** @const @type {number} */ var FADE_MODE_OUT = 2;

/** @const @type {number} */ var SCREEN_TITLE = 0;
/** @const @type {number} */ var SCREEN_INTRO = 1;
/** @const @type {number} */ var SCREEN_MENU = 2;
/** @const @type {number} */ var SCREEN_GAME = 3;
/** @const @type {number} */ var SCREEN_LEVELS = 4;
/** @const @type {number} */ var SCREEN_CHALLENGES = 5;
/** @const @type {number} */ var SCREEN_ABOUT = 6;
/** @const @type {number} */ var SCREEN_HOWTO = 7;

/** @const @type {number} */ var GAME_MODE_LOCAL = 0;
/** @const @type {number} */ var GAME_MODE_CHALLENGE = 1;

/** @const @type {number} */ var MENU_MAIN = 0;
/** @const @type {number} */ var MENU_PLAY = 1;
/** @const @type {number} */ var MENU_OPTIONS = 2;
/** @const @type {number} */ var MENU_PAUSED = 3;
/** @const @type {number} */ var MENU_CUSTOMIZE = 4;

/** @const @type {number} */ var ACTION_OPEN_MENU = 0;
/** @const @type {number} */ var ACTION_CHANGE_SCREEN = 1;
/** @const @type {number} */ var ACTION_CUSTOM = 2;

/** @const @type {number} */ var STAT_FRAMES = 0;
/** @const @type {number} */ var STAT_MOVES = 1;
/** @const @type {number} */ var STAT_PULLS = 2;
/** @const @type {number} */ var STAT_LEVELS_STARTED = 3;
/** @const @type {number} */ var STAT_LEVELS_FINISHED = 4;

// Obj orientations
/** @const @type {number} */ var OBJ_ORIENTATION_NORTH = 0;
/** @const @type {number} */ var OBJ_ORIENTATION_EAST = 1;
/** @const @type {number} */ var OBJ_ORIENTATION_SOUTH = 2;
/** @const @type {number} */ var OBJ_ORIENTATION_WEST = 3;

// Obj animation state
/** @const @type {number} */ var OBJ_STATUS_STANDING = 0;
/** @const @type {number} */ var OBJ_STATUS_WALKING = 1;
/** @const @type {number} */ var OBJ_STATUS_GRAB = 2;
/** @const @type {number} */ var OBJ_STATUS_PULLING = 3;
/** @const @type {number} */ var OBJ_STATUS_FALLING = 4;

// InputHandler
/** @const @type {number} */ var IH_KEY_UP = 0;
/** @const @type {number} */ var IH_KEY_RIGHT = 1;
/** @const @type {number} */ var IH_KEY_DOWN = 2;
/** @const @type {number} */ var IH_KEY_LEFT = 3;
/** @const @type {number} */ var IH_KEY_ACTION = 4;
/** @const @type {number} */ var IH_KEY_CANCEL = 5;

/** @const @type {number} */ var IH_KEY_STAUTS_RESET = 0;
/** @const @type {number} */ var IH_KEY_STAUTS_PRESSED = 1;
/** @const @type {number} */ var IH_KEY_STAUTS_RELEASED = 2;

/** @const @type {number} */ var SOUND_HELLO = 0;
/** @const @type {number} */ var SOUND_MENU = 1;
/** @const @type {number} */ var SOUND_STEP1 = 2;
/** @const @type {number} */ var SOUND_STEP2 = 3;
/** @const @type {number} */ var SOUND_BOX_GRAB = 4;
/** @const @type {number} */ var SOUND_BOX_RELEASE = 5;
/** @const @type {number} */ var SOUND_BOX_PULL = 6;
/** @const @type {number} */ var SOUND_TEXT = 7;
/** @const @type {number} */ var SOUND_NEXT = 8;
/** @const @type {number} */ var SOUND_SPIKE = 9;
/** @const @type {number} */ var SOUND_FALLING = 10;

/** @const @type {number} */ var TOUCH_TRESHOLD = 40;
/** @const @type {number} */ var TOUCH_MODE_CANCEL = 0;
/** @const @type {number} */ var TOUCH_MODE_ACTION = 1;
/** @const @type {number} */ var TOUCH_MODE_MOVE = 2;

/** @const @type {number} */ var LEVEL_DATA_WIDTH = 0;
/** @const @type {number} */ var LEVEL_DATA_HEIGHT = 1;
/** @const @type {number} */ var LEVEL_DATA_APLUS = 2;
/** @const @type {number} */ var LEVEL_DATA_TILES = 3;

/** @const @type {number} */ var SONG_DATA_INTERVAL = 0;
/** @const @type {number} */ var SONG_DATA_CHANNELS = 1;

/** @const @type {number} */ var SONG_CHANNEL_DATA_SAMPLE_ID = 0;
/** @const @type {number} */ var SONG_CHANNEL_DATA_BASE_NOTE = 1;
/** @const @type {number} */ var SONG_CHANNEL_DATA_NOTES = 2;

/** @const @type {string} */ var STORAGE_PLAYER_COLOR_PREFIX = 'c';
/** @const @type {string} */ var STORAGE_PLAYER_UID = 'u';
/** @const @type {string} */ var STORAGE_PLAYER_NAME = 'n';
/** @const @type {string} */ var STORAGE_HIGHSCORES_TIME_PREFIX = 'ha';
/** @const @type {string} */ var STORAGE_HIGHSCORES_MOVES_PREFIX = 'hb';
/** @const @type {string} */ var STORAGE_HIGHSCORES_PULLS_PREFIX = 'hc';

/** @const @type {string} */ var NET_MESSAGE_NEW_BOB = 'b';
/** @const @type {string} */ var NET_MESSAGE_GET_SERVER_STATS = 'c';
/** @const @type {string} */ var NET_MESSAGE_SERVER_STATS = 'd';
/** @const @type {string} */ var NET_MESSAGE_PLAYER_STATS = 'e';

/** @const @type {string} */ var SERVER_DB_KEY_STATS = 's';
/** @const @type {string} */ var SERVER_DB_KEY_SCORES = 't';
