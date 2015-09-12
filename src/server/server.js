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

function statUpdate()
{
	log.debug('statUpdate()');
	
	stats1 = stats2.slice();
	stats2 = stats.slice();
	
	log.debug('stats1: ', stats1);
	log.debug('stats2: ', stats2);
}

io.on('connection', function(socket) {
	log.debug('player connected', socket.id);
	
	socket.emit2 = function(a, b){
		try
		{
			this.emit(a, b);
		}
		catch (err)
		{
		}
	};
	
	socket.on('disconnect', function() {
		log.debug('player disconnected', this.id);
	});
	
	socket.on(NET_MESSAGE_NEW_BOB, function()
	{
		log.debug('new player');
		
		stats[3]++; // players
		
		db(SERVER_DB_KEY_STATS, stats);
	});
	
	socket.on(NET_MESSAGE_PLAYER_STATS, function(data)
	{
		log.debug('received stats', data);
		
		stats[0] += data[0][0]; // frames
		stats[1] += data[0][1]; // moves
		stats[2] += data[0][2]; // pulls
		// stats[3]; // players
		stats[4] += 1; // started levels
		stats[5] += data[1]; // finished levels (0: fail, 1: success)
		
		db(SERVER_DB_KEY_STATS, stats);
	});
	
	socket.on(NET_MESSAGE_PLAYER_CHALLENGE_STATS, function(data)
	{
		var arr, i;
		
		// data is [ challenge id, moves, player uid, player name, colors[3][3] ]
		
		log.debug('received challenge stats', data);
		
		arr = scores[data[0]];
		
		for (i=0; i<arr.length; i++)
		{
			if (arr[i][2] == data[2])
			{
				log.debug("found, #" + i);
				break;
			}
		}
		
		// if not found then "i" will be arr.length
		
		arr[i] = data;
		
		arr.sort(function(a, b) { return a[1] - b[1]; });
		arr.splice(20, 999);
		
		db(SERVER_DB_KEY_SCORES, scores);
	});
	
	socket.on(NET_MESSAGE_GET_SERVER_STATS, function()
	{
		log.debug('seding server stats');
		
		this.emit2(NET_MESSAGE_SERVER_STATS, [ stats1, stats2 ]);
	});
});

statUpdate();
statUpdate();
setInterval(statUpdate, 60000);
