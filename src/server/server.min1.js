'use strict';

/*
	NET_MESSAGE_NEW_BOB = 'b'
	NET_MESSAGE_GET_SERVER_STATS = 'c'
	NET_MESSAGE_SERVER_STATS = 'd'
	NET_MESSAGE_PLAYER_STATS = 'e'
	NET_MESSAGE_PLAYER_CHALLENGE_STATS = 'f'
	NET_MESSAGE_SERVER_CHALLENGE_STATS = 'g'
	
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
	y.e = function(a, b)
	{
		try
		{
			this.emit(a, b);
		}
		catch (e)
		{
		}
	};
	
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
	
	// NET_MESSAGE_PLAYER_CHALLENGE_STATS
	y.on('f', function(d)
	{
		var a, i;
		
		a = t[d[0]];
		
		for (i=0; i<a.length; i++)
		{
			if (a[i][2] == d[2])
			{
				if (a[i][1] < d[1])
				{
				
					i = -1;
				}
				break;
			}
		}
		
		if (i > -1)
		{
			a[i] = d;
			a.sort(function(a, b) { return a[1] - b[1]; });
			a.splice(20, 999);
		}
		
		this.e('g', t);
		
		db('t', t);
	});
	
	// NET_MESSAGE_GET_SERVER_STATS
	y.on('c', function(){
		// NET_MESSAGE_SERVER_STATS
		this.e('d', [ u, v ]);
		this.e('g', t);
	});
});

r();
r();
setInterval(r, 60000);
