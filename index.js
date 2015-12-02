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
    	messages.push(data.message);
        io.sockets.emit('new_message', { message : messages, name : data.name });
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

		messages.push('Welcome to the chat ' + data.message + "!");
    	io.sockets.emit('new_message', { message : messages, name : data.message });

        io.sockets.emit('update_user_freq', { message: counter });
        io.sockets.emit('update_user_list', users);
    });
});


console.log("Listening on port " + port);