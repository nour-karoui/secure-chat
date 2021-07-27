exports = module.exports = function(io) {
  //Set Listeners
  io.on('connection', (socket)=> {
    console.log('a user has connected');
    
    socket.on('new message', (socketMsg) => {
      io.sockets.in(socketMsg.channel).emit('refresh messages', socketMsg);
      console.log('new message received in channel', socketMsg)
    });

    socket.on('enter privateMessage', (conversationId) => {
     socket.join(conversationId);
    });

    socket.on('leave privateMessage', (conversationId) => {
      socket.leave(conversationId);
    })

    socket.on('new privateMessage', (socketMsg) => {
      io.sockets.in(socketMsg.conversationId).emit('refresh privateMessages', socketMsg);
    })

    socket.on('user typing', (data) => {
      io.sockets.in(data.conversationId).emit('typing', data)
    })

    socket.on('disconnect', () => {
      console.log('user disconnected')
    });
  });
}
