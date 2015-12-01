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
var counter = 0;
var io = require('socket.io').listen(app.listen(port));
io.sockets.on('connection', function (socket) {
    socket.emit('new_message', { message: 'Welcome to the chat' });
    counter++;
    io.sockets.emit('update_user_freq', { message: counter });

    socket.on('send', function (data) {
        io.sockets.emit('new_message', data);
    });
    socket.on('user_unloaded', function (data) {
        counter--;
        delete users[data.message];

        io.sockets.emit('update_user_freq', { message: counter });
        io.sockets.emit('update_user_list', users);
    });
    socket.on('user_loaded', function (data) {
        users[data.message] = true;

        io.sockets.emit('update_user_freq', { message: counter });
        io.sockets.emit('update_user_list', users);
    });
});


console.log("Listening on port " + port);