const net = require('net');
const path = require('path');
const util = require('./util');

const server = net.createServer();
const PORT = process.env.PORT || 8080;

server.on('connection', (socket) => {
  console.log('**** client connected ****');

  socket.on('data', async (msg) => {
    console.log('--->', msg.toString());
    const filterObject = JSON.parse(msg.toString());

    try {
      const { filter, meta } = await util.schemaFilter.validateAsync(filterObject);
      const data = await util.readFile('users.json', 'utf8');
      const users = JSON.parse(data);
      let correctUsers = util.findUserByFilter(users, filter);
      if (meta.format === 'csv') {
        correctUsers = util.convertCsv(correctUsers);
      }
      if (meta.archive) {
        util.arhivator(correctUsers, path.join(__dirname, 'userFilter.gz'));
        return socket.write('From server: users is archived');
      }
      socket.write(`From server: ${correctUsers}`);
    } catch (err) {
      console.log(err);
    }
  });

  socket.on('end', () => {
    console.log('**** сlient is disconnected ****');
  });
});

server.on('listening', () => {
  const { port } = server.address();
  console.log(`TCP Server started on port ${port}!`);
});

server.listen(PORT);
