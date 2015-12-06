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

    socket.on('send', function (data) {
    	if (data.name in users) {
    		messages.push("[" + data.time + "] " + data.name + ": " + data.message);
        	io.sockets.emit('new_message', { message : messages, name : data.name });
        }
    });
    socket.on('user_unloaded', function (data) {
        counter--;
        delete users[data.message];

        if (counter === 0) {
        	messages = [];
        }

        messages.push("<font color=\"red\"><b>[" + data.time + "] " + data.message + " left the room!</b></font>");
        io.sockets.emit('server_user_loaded', { message : messages, name : data.message });

        io.sockets.emit('update_user_freq', { message: counter });
        io.sockets.emit('update_user_list', users);
    });
    socket.on('user_loaded', function (data) {
    	counter++;
        users[data.message] = true;

		messages.push("<font color=\"green\"><b>[" + data.time + "] " + data.message + " joined the room!</b></font>");
    	io.sockets.emit('server_user_loaded', { message : messages, name : data.message });

        io.sockets.emit('update_user_freq', { message: counter });
        io.sockets.emit('update_user_list', users);
    });
    socket.on('get_random_name', function (data) {
    	if (data.gender == "m") {
    		switch (data.type) {
    			case "rapper":
    				getRandomRapperMaleName(socket);
    			break;
    			case "maori":
    				getRandomMaoriMaleName(socket);
    			break;
    			case "chinese":
    				getRandomChineseMaleName(socket);
    			break;
    			case "japanese":
    				getRandomJapaneseMaleName(socket);
    			break;
    			case "indian":
    				getRandomIndianMaleName(socket);
    			break;
    			case "korean":
    				getRandomKoreanMaleName(socket);
    			break;
    			default:
    				getRandomNameFromAll(socket);
    				break;
    		}
    	} else {
    		switch (data.type) {
    			case "rapper":
    				getRandomRapperFemaleName(socket);
    			break;
    			case "maori":
    				getRandomMaoriFemaleName(socket);
    			break;
    			case "chinese":
    				getRandomChineseFemaleName(socket);
    			break;
    			case "japanese":
    				getRandomJapaneseFemaleName(socket);
    			break;
    			case "indian":
    				getRandomIndianFemaleName(socket);
    			break;
    			case "korean":
    				getRandomKoreanFemaleName(socket);
    			break;
    			default:
    				getRandomNameFromAll(socket);
    				break;
    		}
    	}
    })
});

function generateFiveRandomLetters () {
	// makes a random string to feed into the wutang website to get a random rapper name
    var text = "";
    var possible = "abcdefghijklmnopqrstuvwxyz";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
function getRandomName(socket, behindthenameParameters) {
    var http = require('http');
	var options = {
	    hostname: "www.behindthename.com",
	    path: "/random/random.php?" + behindthenameParameters,
	    method: 'GET'
	};

	var str = "";
	var req = http.request(options, function(res) {
	    res.on('data', function (chunk) {
	       	str+=chunk;
    	});
    	res.on('end', function() {
	        var s = str.slice(str.indexOf("<p><span class=\"heavyhuge\">") + "<p><span class=\"heavyhuge\">".length,
    		str.indexOf("</span></p>"));
    		s = s.replace("\n", "").trim();
        	socket.emit('send_random_name', { message : s });
    	});
	});
	req.end();
}
function getRandomRapperMaleName (socket) {
	getRandomName(socket, "number=1&gender=m&surname=&randomsurname=yes&all=no&usage_rap=1");
}
function getRandomRapperFemaleName (socket) {
	getRandomName(socket, "number=1&gender=f&surname=&randomsurname=yes&all=no&usage_rap=1");
}
function getRandomIndianMaleName (socket) {
	getRandomName(socket, "number=1&gender=m&surname=&randomsurname=yes&all=no&usage_ind=1&usage_indm=1")
}
function getRandomIndianFemaleName (socket) {
	getRandomName(socket, "number=1&gender=f&surname=&randomsurname=yes&all=no&usage_ind=1&usage_indm=1")
}
function getRandomArabicMaleName (socket) {
	getRandomName(socket, "number=1&gender=m&surname=&randomsurname=yes&all=no&usage_ara=1")
}
function getRandomArabicFemaleName (socket) {
	getRandomName(socket, "number=1&gender=f&surname=&randomsurname=yes&all=no&usage_ara=1")
}
function getRandomChineseMaleName (socket) {
	getRandomName(socket, "number=1&gender=m&surname=&randomsurname=yes&all=no&usage_chi=1")
}
function getRandomChineseFemaleName (socket) {
	getRandomName(socket, "number=1&gender=f&surname=&randomsurname=yes&all=no&usage_chi=1")
}
function getRandomKoreanMaleName (socket) {
	getRandomName(socket, "number=1&gender=m&surname=&randomsurname=yes&all=no&usage_kor=1")
}
function getRandomKoreanFemaleName (socket) {
	getRandomName(socket, "number=1&gender=f&surname=&randomsurname=yes&all=no&usage_kor=1")
}
function getRandomJapaneseMaleName (socket) {
	getRandomName(socket, "number=1&gender=m&surname=&randomsurname=yes&all=no&usage_jap=1")
}
function getRandomJapaneseFemaleName (socket) {
	getRandomName(socket, "number=1&gender=f&surname=&randomsurname=yes&all=no&usage_jap=1")
}
function getRandomMaoriMaleName (socket) {
	getRandomName(socket, "number=1&gender=m&surname=&randomsurname=yes&all=no&usage_mao=1")
}
function getRandomMaoriFemaleName (socket) {
	getRandomName(socket, "number=1&gender=f&surname=&randomsurname=yes&all=no&usage_mao=1")
}
function getRandomNameFromAll(socket) {
	getRandomName(socket, "number=2&gender=m&surname=&randomsurname=yes&all=yes")
}