const { Socket } = require('net');

const client = new Socket();
client.connect(8080, () => {
  const data = {
    filter: {
      // name: {
      //   first: 'John',
      // },
      email: '@yahoo.com',
    },
    meta: {
      format: 'csv',
      archive: true,
    },
  };
  client.write(JSON.stringify(data));
});

client.on('data', (data) => {
  console.log(`Received: ${data}`);
  client.destroy();
});

client.on('close', () => {
  console.log('Connection closed!');
});
