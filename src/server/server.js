'use strict';

/*
	NET_MESSAGE_GET_SERVER_STATS = 'c'
	NET_MESSAGE_SERVER_STATS = 'd'
	NET_MESSAGE_PLAYER_STATS = 'e'
	
	SERVER_DB_KEY_STATS = 's'
	SERVER_DB_KEY_SCORES = 't'
*/

var io = require('sandbox-io');
var players = [];

var stats = db(SERVER_DB_KEY_STATS) || [ 0, 0, 0, 0, 0, 0 ];
var scores = db(SERVER_DB_KEY_SCORES) || [ [], [], [], [], [], [] ];
var stats1 = [];
var stats2 = [];

/** @constructor */
var Player = function(socket)
{
	log.debug('Connected.', socket.id);
	
	socket.emit2 = function(a, b){
		try
		{
			this.emit(a, b);
		}
		catch (err)
		{
		}
	};
	socket.on('disconnect', this.onDisconnect.bind(this));
	socket.on(NET_MESSAGE_NEW_BOB, this.onNewBob.bind(this));
	socket.on(NET_MESSAGE_PLAYER_STATS, this.onStat.bind(this));
	socket.on(NET_MESSAGE_GET_SERVER_STATS, this.onGetServerStats.bind(this));
	
	this.socket = socket;
}

Player.prototype.onDisconnect = function()
{
	log.debug('Disconnected.', this.socket.id);
}

Player.prototype.onStat = function(data)
{
	log.debug('onStat(): ', data);
	
	stats[0] += data[0][0]; // frames
	stats[1] += data[0][1]; // moves
	stats[2] += data[0][2]; // pulls
	stats[3] += 0; // players
	stats[4] += 1; // started levels
	stats[5] += data[1]; // finished levels (0: fail, 1: success)
	
	db(SERVER_DB_KEY_STATS, stats);
}

Player.prototype.onNewBob = function()
{
	log.debug('new player');
	
	stats[3]++; // players
	db(SERVER_DB_KEY_STATS, stats);
}

Player.prototype.onGetServerStats = function()
{
	this.socket.emit2(NET_MESSAGE_SERVER_STATS, [ stats1, stats2 ]);
}

function statUpdate()
{
	stats1 = stats2.slice();
	stats2 = stats.slice();
	
	log.debug('statUpdate()', stats);
}

io.on('connection', function(socket) {
	log.debug('New connection', socket.id);
	players.push(new Player(socket));
});

statUpdate();
statUpdate();
setInterval(statUpdate, 60000);
