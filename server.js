var express = require('express')
var app = express()
var server = require('http').createServer(app)
var io = require('socket.io').listen(server)

users = []
connections = []

server.listen(process.env.PORT || 3000)
console.log('Server running on port 3000')

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html')
})

io.sockets.on('connection', function(socket) {
    connections.push(socket)

    console.log('Connected: %s sockets connected', connections.length)

    // Disconnect
    socket.on('disconnect', function(data) {
        connections.splice(connections.indexOf(socket), 1)
        users = users.filter(function(obj) { return obj.id !== socket.id; })
        updateUsers();
        console.log('Disconnected: %s sockets connected', connections.length)
    })

    socket.on("new user", function(data) {
        users.push({
            id:socket.id,
            posx:0,
            posy:0,
            color: getRandomColor(),
            username: data
        });
        updateUsers();
        console.log("new user boys" + data);
    });

    socket.on('left', function() {
        var user = fetchUser(socket.id);
        user.posx -= 5;
        updateUsers();
    })

    socket.on('right', function() {
        var user = fetchUser(socket.id);
        user.posx += 5;
        updateUsers();
    })

    socket.on('up', function() {
        var user = fetchUser(socket.id);
        user.posy -= 5;
        updateUsers();
    })
    socket.on('down', function() {
        var user = fetchUser(socket.id);
        user.posy += 5;
        updateUsers();
    })
    function fetchUser(id) {
        return users.filter(function( user ) {
          return user.id == id;
      })[0];
    }

    function updateUsers() {
        io.sockets.emit('get users', users);
    }

    function getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++ ) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
})
