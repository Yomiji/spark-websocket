protobuf.load("chatmsg.proto", function (err, root) {
    if (err)
        throw err;
    // Obtain a message type
    var Message = root.lookupType("grouple.Message");

    var currentUser = "guest";
    var currentUserList = undefined;

//Establish the WebSocket connection and set up event handlers
    var webSocket = new WebSocket("ws://" + location.hostname + ":" + location.port + "/chat");
    webSocket.onload = function () {
        webSocket
    };
    webSocket.onmessage = function (msg) {
        updateChat(msg);
    };
    webSocket.onclose = function () {
        alert("WebSocket connection closed")
    };
    webSocket.binaryType = 'arraybuffer';

//Send message if "Send" is clicked
    id("send").addEventListener("click", function () {
        var currentDate = new Date().getTime() / 1000;
        sendMessage(enc(currentUser, id("message").value, currentDate.toString()));
    });

//Send message if enter is pressed in the input field
    id("message").addEventListener("keypress", function (e) {
        if (e.keyCode === 13) {
            var currentDate = new Date().getTime() / 1000;
            sendMessage(enc(currentUser, e.target.value, currentDate.toString()));
        }
    });

//Send a message if it's not empty, then clear the input field
    function sendMessage(message) {
        if (message !== "") {
            webSocket.send(message);
            id("message").value = "";
        }
    }

//Update the chat-panel, and the list of connected users
    function updateChat(msg) {
        var data = dec(msg);
        var d = new Date(0);
        d.setUTCSeconds(data.timestamp);
        insertAfter("chat", data.user
            + "@" + d.toLocaleDateString('en-US')  + " " + d.toLocaleTimeString('en-US') +": "
            + data.msg);

        id("userlist").innerHTML = "";
        data.userlist.forEach(function (user) {
            insert("userlist", "<li>" + user + "</li>");
        });
        currentUserList = data.userlist;
    }

//Helper function for inserting HTML as the first child of an element
    function insert(targetId, message) {
        id(targetId).insertAdjacentHTML("afterbegin", message);
    }

    function insertAfter(targetId, message) {
        var newEl = document.createElement('div');
        newEl.innerHTML = '<p>'+message+'</p>';
        id(targetId).parentNode.insertBefore(newEl, id(targetId).nextSibling);
    }

//Helper function for selecting element by id
    function id(id) {
        return document.getElementById(id);
    }

    function enc(user, msg, date) {
        var payload = {
            "msg": msg,
            "user": user,
            "timestamp": date,
            "userlist": currentUserList
        };
        var errMsg = Message.verify(payload);
        if (!errMsg)
            return Message.encode(Message.create(payload)).finish();
        else
            return Message.encode(Message.emptyObject).finish();
    }

    function dec(buffer) {
        var uint8array = new Uint8Array(buffer.data, 0, buffer.data.byteLength);
        var message = Message.decode(uint8array);
        return Message.toObject(message, {
            enums: String,
            bytes: String,
            defaults: true, // includes default values
            arrays: true,   // populates empty arrays (repeated fields) even if defaults=false
            objects: true  // populates empty objects (map fields) even if defaults=false
            // see ConversionOptions
        });
    }
});
