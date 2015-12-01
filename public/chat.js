window.onload = function() {
    socket = io.connect();

    // ask the user for a name 
    while (!(name = prompt("What is your name?"))) {

    }
    socket.emit('user_loaded', { message : name });

    var field = document.getElementById("field");
    var sendButton = document.getElementById("send");
    var content = document.getElementById("content");
    var number = document.getElementById("number");
    var user_list = document.getElementById("user_list");
 
    socket.on('new_message', function (data) {
        var html = '';
        for(var i = 0; i < data.message.length; i++) {
            html += data.message[i] + '<br />';
        }
        content.innerHTML = html;
    });

    socket.on('update_user_freq', function (data) {
        var numberOfUsers = parseInt(data.message);
        if (numberOfUsers > 1) {
            number.innerHTML = data.message + ' users online';
        } else {
            number.innerHTML = "You're the only user online :(";
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
 
    function sendMessage() {
        var text = name + ": " + field.value;
        socket.emit('send', { message: text });
        field.value = "";
    };

    sendButton.onclick = sendMessage;

    field.onkeydown = function(event) {
        event = event || window.event;
        var keycode = event.charCode || event.keyCode;
        if(keycode === 13) {
            sendMessage();
        }
    }
}

window.onbeforeunload = function() {
    socket.emit('user_unloaded', { message : name });
    return;
}