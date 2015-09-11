'use strict';

/*
	NET_MESSAGE_NEW_BOB = 'b'
	NET_MESSAGE_GET_SERVER_STATS = 'c'
	NET_MESSAGE_SERVER_STATS = 'd'
	NET_MESSAGE_PLAYER_STATS = 'e'
	
	SERVER_DB_KEY_STATS = 's'
	SERVER_DB_KEY_SCORES = 't'
*/

var io = require('sandbox-io'),
	s = db('s') || [ 0, 0, 0, 0, 0, 0 ],
	t = db('t') || [ [], [], [], [], [], [] ],
	u = [],
	v = [];

function r()
{
	u = v.slice();
	v = s.slice();
}

io.on('connection', function(y) {
	
	// NET_MESSAGE_PLAYER_STATS
	y.on('e', function(d) {
		s[0] += d[0][0]; // frames
		s[1] += d[0][1]; // moves
		s[2] += d[0][2]; // pulls
		s[4] += 1; // started levels
		s[5] += d[1]; // finished levels (0: fail, 1: success)
		
		db('s', s);
	});
	
	// NET_MESSAGE_NEW_BOB
	y.on('b', function() {
		s[3]++; // players
		db('s', s);
	});
	
	// NET_MESSAGE_GET_SERVER_STATS
	y.on('c', function(){
		try
		{
			// NET_MESSAGE_SERVER_STATS
			this.emit('d', [ u, v ]);
		}
		catch (e)
		{
		}
	});
});

r();
r();
setInterval(r, 60000);
