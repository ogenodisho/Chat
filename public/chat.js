window.onfocus = function () { 
  isActive = true; 
}; 

window.onblur = function () { 
  isActive = false; 
};

hasJoined = false; 

window.onload = function() {
    socket = io.connect();
    numberOfUnread = 0;
    name = "";

    var field = document.getElementById("field");
    var sendButton = document.getElementById("send");
    sendButton.disabled = true;
    var tab_title = document.getElementById("tab_title");
    var content = document.getElementById("content");
    var number = document.getElementById("number");
    var user_list = document.getElementById("user_list");
    var random_name_field = document.getElementById("random_name_field");
    var random_name_button = document.getElementById("random_name_button");
    var random_rapper = document.getElementById("rapper");
    var random_chinese = document.getElementById("chinese");
    var random_japanese = document.getElementById("japanese");
    var random_korean = document.getElementById("korean");
    var random_indian = document.getElementById("indian");
    var random_maori = document.getElementById("maori");
    var join_chat = document.getElementById("join_chat");
    join_chat.disabled = true;

    random_name_field.onkeydown = function(event) {
        event = event || window.event;
        var keycode = event.charCode || event.keyCode;
        if(keycode === 13 && !join_chat.disabled) {
            joinChat();
        }
    };
    random_name_field.onkeyup = function(event) {
        join_chat.disabled = random_name_field.value.trim().length == 0 ? true : false;
    };

    join_chat.onclick = joinChat;

    function joinChat() {
        var time = getCurrentTime24Hr();
        name = random_name_field.value;
        socket.emit('user_loaded', { message : name, time : time });
        document.getElementById("join_chat_div").style.display = "none";
        hasJoined = true;
    };

    random_name_button.onclick = function () {
        socket.emit('get_random_name', { gender : "m", type : ""});
    };
    random_rapper.onclick = function () {
        socket.emit('get_random_name', { gender : "m", type : "rapper"});  
    }
    random_chinese.onclick = function () {
        socket.emit('get_random_name', { gender : "m", type : "chinese"});  
    }
    random_japanese.onclick = function () {
        socket.emit('get_random_name', { gender : "m", type : "japanese"});  
    }
    random_korean.onclick = function () {
        socket.emit('get_random_name', { gender : "m", type : "korean"});  
    }
    random_indian.onclick = function () {
        socket.emit('get_random_name', { gender : "m", type : "indian"});  
    }
    random_maori.onclick = function () {
        socket.emit('get_random_name', { gender : "m", type : "maori"});  
    }

    socket.on('send_random_name', function (data) {
        random_name_field.value = data.message;
        join_chat.disabled = false;
    });
 
    socket.on('new_message', function (data) {
        var html = '';
        for(var i = 0; i < data.message.length; i++) {
            html += data.message[i] + '<br />';
        }
        content.innerHTML = html;

        if (data.name != name) {
            numberOfUnread = isActive ? 0 : numberOfUnread + 1;
            tab_title.innerHTML = numberOfUnread == 0 ? "Chatogen" : "(" + numberOfUnread + ") " + "Chatogen";
            var audio = new Audio('new_message.mp3');
            audio.play();
        }

        content.scrollTop = content.scrollHeight;
    });

    socket.on('update_user_freq', function (data) {
        var numberOfUsers = parseInt(data.message);
        if (numberOfUsers > 1) {
            number.innerHTML = data.message + ' users online:';
        } else {
            number.innerHTML = '1 user online:';
        }
    });

    socket.on('update_user_list', function (data) {
        user_list.innerHTML = "";
        for (var curr_name in data) {
            if (curr_name !== name) {
                var li = document.createElement("li");
                li.appendChild(document.createTextNode(curr_name));
                user_list.appendChild(li);
            }
        }
        var li = document.createElement("li");
        li.appendChild(document.createTextNode("You!"));
        user_list.appendChild(li);
    });

    socket.on('server_user_loaded', function (data) {
        var html = '';
        for(var i = 0; i < data.message.length; i++) {
            html += data.message[i] + '<br />';
        }
        content.innerHTML = html;

        if (data.name != name) {
            numberOfUnread = isActive ? 0 : numberOfUnread + 1;
            tab_title.innerHTML = numberOfUnread == 0 ? "Chatogen" : "(" + numberOfUnread + ") " + "Chatogen";
        }

        content.scrollTop = content.scrollHeight;
    });
    socket.on('server_user_unloaded', function (data) {
        var html = '';
        for(var i = 0; i < data.message.length; i++) {
            html += data.message[i] + '<br />';
        }
        content.innerHTML = html;

        if (data.name != name) {
            numberOfUnread = isActive ? 0 : numberOfUnread + 1;
            tab_title.innerHTML = numberOfUnread == 0 ? "Chatogen" : "(" + numberOfUnread + ") " + "Chatogen";
        }

        content.scrollTop = content.scrollHeight;
    });
 
    function sendMessage() {
        var time = getCurrentTime24Hr();
        socket.emit('send', { message: field.value, name : name, time : time });
        field.value = "";
        sendButton.disabled = true;
    };

    sendButton.onclick = sendMessage;

    field.onkeydown = function(event) {
        event = event || window.event;
        var keycode = event.charCode || event.keyCode;
        if(keycode === 13 && !sendButton.disabled) {
            sendMessage();
        }

        numberOfUnread = 0;
        tab_title.innerHTML = "Chatogen";
    };
    field.onkeyup = function(event) {
        sendButton.disabled = field.value.trim().length == 0 ? true : false;
    };
    field.onclick = function() {
        numberOfUnread = 0;
        tab_title.innerHTML = "Chatogen";
    }
}

window.onbeforeunload = function() {
    if (hasJoined) {
        var time = getCurrentTime24Hr();
        socket.emit('user_unloaded', { message : name, time : time });  
        return;
    }
}

function getCurrentTime24Hr() {
    var date = new Date();
    var hours = date.getHours();
    if (hours < 10) {
        hours = "0" + hours;
    }
    var minutes = date.getMinutes();
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    var strTime = hours + ':' + minutes;
    return strTime;
}