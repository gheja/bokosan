var app = require('http').createServer(handler),
	io = require('socket.io').listen(app),
	fs = require('fs');

// DEBUG BEGIN
function _log(socket, s)
{
	console.log("[" + (new Date()).getTime() + "] [" + socket.id + "] " + s);
}
// DEBUG END

function handler(request, response)
{
	_log({}, "http request: " + request.url);
	
	if (request.url != "/" && request.url.indexOf("/?") != 0)
	{
		response.writeHead(302, { "Location": "/" } );
		response.end();
		return;
	}
	
	fs.readFile("index.html", function(error, data) {
		if (!error)
		{
			_log({}, "  serving index.html");
			response.writeHead(200);
			return response.end(data);
		}
	});
}

function sortAndTrimArray(array, key, size)
{
	array.sort(function(a, b) { return a[key] - b[key]; }).splice(size, 999);
	
	return array;
}

var _currentPlayerCount = 0;

io.sockets.on("connection", function(socket) {
	_log(socket, "connected");
	_currentPlayerCount++;
	_log({}, "current player count: " + _currentPlayerCount);
	
	socket.on("disconnect", function() {
		_log(socket, "disconnected");
		_currentPlayerCount--;
		_log({}, "current player count: " + _currentPlayerCount);
	});
	
	socket.on("stat", function() {
		_log(socket, "< stat");
	});
	
	socket.on("getstat", function() {
		_log(socket, "< getstat");
	});
	
	socket.on("finished", function(data) {
		_log(socket, "< finished");
	});
});

app.listen(8080);
