"use strict";

/** @const @type {number} */ var WIDTH = 420;
/** @const @type {number} */ var HEIGHT = 280;

/** @const @type {number} */ var FADE_MODE_NONE = 0;
/** @const @type {number} */ var FADE_MODE_IN = 1;
/** @const @type {number} */ var FADE_MODE_OUT = 2;

/** @const @type {number} */ var SCREEN_INTRO = 0;
/** @const @type {number} */ var SCREEN_MENU = 1;
/** @const @type {number} */ var SCREEN_HIGHSCORE = 2;
/** @const @type {number} */ var SCREEN_DIALOG_HELLO = 3;
/** @const @type {number} */ var SCREEN_DIALOG_FAIL1 = 4;
/** @const @type {number} */ var SCREEN_DIALOG_FAIL2 = 5;
/** @const @type {number} */ var SCREEN_GAME = 6;

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

/** @const @type {number} */ var SOUND_NEXT = 0;
/** @const @type {number} */ var SOUND_MENU = 1;
/** @const @type {number} */ var SOUND_STEP1 = 2;
/** @const @type {number} */ var SOUND_STEP2 = 3;
/** @const @type {number} */ var SOUND_BOX_GRAB = 4;
/** @const @type {number} */ var SOUND_BOX_RELEASE = 5;
/** @const @type {number} */ var SOUND_BOX_PULL = 6;
/** @const @type {number} */ var SOUND_TEXT = 7;
