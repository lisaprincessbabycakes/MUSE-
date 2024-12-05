const path = require('path');
const express = require("express");
const app = express();
const server = require('http').Server(app);
const port = 3000;

server.listen(port, () => {
  console.log('server is listening on port ' + port);
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.use(express.static('public'));
app.use(express.static('node_modules/p5/lib'));
app.use(express.static('node_modules/p5/lib/addons'));

// === socket stuff ===

const io = require('socket.io')(server);

io.on('connection', (socket) => { 
  socket.on('touchChange', (data) => {
    //console.log(data);
    socket.broadcast.emit('incomingTouch', data);    
  });
  socket.on('disconnect', (reason) => {
    socket.broadcast.emit('removeTouch', socket.id);
  });
});