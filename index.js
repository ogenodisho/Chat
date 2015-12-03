var express = require("express");
var app = express();
var port = process.env.PORT || 8080;

var users = {};

app.set('views', __dirname + '/views');
app.set('view engine', "jade");
app.engine('jade', require('jade').__express);
app.get("/", function(req, res) {
    res.render("page");
});
app.use(express.static(__dirname + '/public'));

// server will store how many users
var counter = 0;
var messages = [];

var io = require('socket.io').listen(app.listen(port));
io.sockets.on('connection', function (socket) {

    counter++;

    socket.on('send', function (data) {
    	if (data.name in users) {
    		messages.push(data.message);
        	io.sockets.emit('new_message', { message : messages, name : data.name });
        }
    });
    socket.on('user_unloaded', function (data) {
        counter--;
        delete users[data.message];

        if (counter === 0) {
        	messages = [];
        }

        io.sockets.emit('update_user_freq', { message: counter });
        io.sockets.emit('update_user_list', users);
    });
    socket.on('user_loaded', function (data) {
        users[data.message] = true;

		messages.push(data.message + " joined the room!");
    	io.sockets.emit('new_message', { message : messages, name : data.message });

        io.sockets.emit('update_user_freq', { message: counter });
        io.sockets.emit('update_user_list', users);
    });
    socket.on('get_random_name', function (data) {
    	sendRandomWutangName(socket);
    })
});

function randomWutangNameHelper () {
	// makes a random string to feed into the wutang website to get a random rapper name
    var text = "";
    var possible = "abcdefghijklmnopqrstuvwxyz";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
function sendRandomWutangName(socket) {
    var http = require('http');
    var data = {
   realname: randomWutangNameHelper()
};
var querystring = require("querystring");
var qs = querystring.stringify(data);
var qslength = qs.length;
var options = {
    hostname: "www.mess.be",
    path: "/inickgenwuname.php",
    method: 'POST',
    headers:{
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': qslength
    }
};

var str = "";
var req = http.request(options, function(res) {
    res.on('data', function (chunk) {
       str+=chunk;
    });
    res.on('end', function() {
        var s = str.slice(str.indexOf("From this day forward, I will be known as... ") + "From this day forward, I will be known as... ".length,
    		str.indexOf("-And you"));
    	s = s.replace("\n", "").trim();
        socket.emit('send_random_name', { message : s });
    });
});

req.write(qs);
req.end();
}