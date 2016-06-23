var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var cache = {};

/*
 * When Not Exist Request Resource
 */
function send404(response){
	response.writeHead(404, {'Content-Type':'text/plain'});
	response.write('Error 404: resource not found\n');
	response.end();
}

/*
 * Send File Data
 */
function sendFile(response, filepath, fileContents){
	response.writeHead(
			200,
			{"Content-type":mime.lookup(path.basename(filepath))}
	);
	response.end(fileContents);
}

/*
 * Static File Service
*/
function serveStatic(response, cache, absPath){
	if(cache[absPath]){
		sendFile(response, absPath, cache[absPath]);
	}else{
		fs.exists(absPath,function(exists){
			if(exists){
				fs.readFile(absPath, function(err, data){
					if(err){
						send404(response);
					}else{
						cache[absPath] = data;
						sendFile(response, absPath, data);
					}
				});
			}else{
				send404(response);
			}
		});
	}
}

/*
 *  HTTP Server
 */
var server = http.createServer(function (request, response){
	var filePath = false;
	if(request.url == '/'){
		filePath = 'public/index.html';
	}else{
		filePath = 'public'+request.url;
	}
	
	var absPath = './'+filePath;
	serveStatic(response, cache, absPath);
});

server.listen(3333,function(){
	console.log("Server listening on port 3333");
});

/*
 * Socket IO Server
 */
var chatServer = require('./lib/chat_server');
chatServer.listen(server);