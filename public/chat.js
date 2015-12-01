var socket = null;

window.onload = function() {
 
    var messages = [];
    socket = io.connect();
    var field = document.getElementById("field");
    var sendButton = document.getElementById("send");
    var content = document.getElementById("content");

    var number = document.getElementById("number");
 
    socket.on('new_message', function (data) {
        if(data.message) {
            messages.push(data.message);
            var html = '';
            for(var i=0; i<messages.length; i++) {
                html += messages[i] + '<br />';
            }
            content.innerHTML = html;
        } else {
            console.log("There is a problem: ", data);
        }
    });

    socket.on('update_user_freq', function (data) {
        var numberOfUsers = parseInt(data.message);
        if (numberOfUsers > 1) {
            number.innerHTML = data.message + ' users online';
        } else {
            number.innerHTML = "You're the only user online :(";
        }
    });
 
    function sendMessage() {
        var text = field.value;
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
    socket.emit('user_unloaded', {});
    return;
}