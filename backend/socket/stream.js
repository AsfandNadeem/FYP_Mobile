module.exports = function(io) {
  io.on('connection', (socket) => {
socket.on('refresh', data => {
  console.log("______________________________________________________________________");
  io.emit('refreshpage',{});
});
  });
};
