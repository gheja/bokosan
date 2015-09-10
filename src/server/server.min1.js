'use strict';

/*
	NET_MESSAGE_GET_NEW_UID = 'a'
	NET_MESSAGE_SET_UID = 'b'
	NET_MESSAGE_GET_SERVER_STATS = 'c'
	NET_MESSAGE_SERVER_STATS = 'd'
	NET_MESSAGE_PLAYER_STATS = 'e'
	
	SERVER_DB_KEY_STATS = 's'
	SERVER_DB_KEY_SCORES = 't'
*/

var io = require('sandbox-io'),
	p = [],
	s = db('s') || [ 0, 0, 0, 0, 0, 0 ],
	t = db('t') || [ [], [], [], [], [], [] ],
	s1 = [],
	s2 = [];

/** @constructor */
var P = function(x)
{
	x.e = function(a, b){
		try
		{
			this.emit(a, b);
		}
		catch (e)
		{
		}
	};
	x.on('e', this.A.bind(this));
	x.on('a', this.B.bind(this));
	x.on('c', this.C.bind(this));
	
	this.x = x;
}

P.prototype.A = function(d)
{
	s[0] += d[0][0]; // frames
	s[1] += d[0][1]; // moves
	s[2] += d[0][2]; // pulls
	s[3] += 0; // players
	s[4] += 1; // started levels
	s[5] += d[1]; // finished levels (0: fail, 1: success)
	
	db('s', s);
}

P.prototype.B = function()
{
	this.x.e('b', Math.random());
	
	s[3]++; // players
	db('s', s);
}

P.prototype.C = function()
{
	this.x.e('d', [ s1, s2 ]);
}

function S()
{
	s1 = s2.slice();
	s2 = s.slice();
}

io.on('connection', function(x) {
	p.push(new P(x));
});

S();
S();
setInterval(S, 60000);
