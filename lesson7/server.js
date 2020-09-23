const net = require('net');
const fs = require('fs');
const os = require('os');
const zlib = require('zlib');
const Joi = require('joi');
const { promisify } = require('util');

const server = net.createServer();
const PORT = process.env.PORT || 8080;
const readFile = promisify(fs.readFile);

const findUser = (file, filter) => {
  let result = file;
  Object.keys(filter).forEach((key) => {
    if (key === 'address' || key === 'name') {
      Object.keys(filter[key]).forEach((elem) => {
        result = result.filter((item) => item[key][elem].includes(filter[key][elem]));
      });
    } else {
      result = result.filter((item) => item[key].includes(filter[key]));
    }
  });

  if (result.length === 0) {
    result = 'Пользователи не найдены';
  }

  return result;
};

const convertCsv = (data) => {
  if (typeof data === 'string') {
    return data;
  }

  let result = `id;nameFirst;nameLast;phone;addressZip;addressCity;addressCountry;addressStreet;email;${os.EOL}`;
  data.forEach((n) => {
    result += `${n.id};${n.name.first};${n.name.last};${n.phone};
    ${n.address.zip};${n.address.city};${n.address.country};${n.address.street};${n.email};${os.EOL}`;
  });
  return result;
};

const arhivator = (data) => {
  const gzip = zlib.createGzip(data);
  const write = fs.createWriteStream('userFilter.gz');
  gzip.pipe(write);
};

server.on('connection', (socket) => {
  console.log('**** client connected ****');

  socket.on('data', async (msg) => {
    console.log('--->', msg.toString());
    const filterObject = JSON.parse(msg.toString());
    const schemaFilter = Joi
      .object()
      .keys({
        filter: Joi.object()
          .keys({
            name: Joi
              .object()
              .keys({
                first: Joi.string(),
                last: Joi.string(),
              })
              .unknown(false),
            phone: Joi.string(),
            address: Joi
              .object()
              .keys({
                zip: Joi.string(),
                city: Joi.string(),
                country: Joi.string(),
                street: Joi.string(),
                email: Joi.string(),
              })
              .unknown(false),
            email: Joi.string(),
          })
          .unknown(false),
        meta: Joi.object()
          .keys({
            format: Joi.string(),
            archive: Joi.boolean(),
          })
          .unknown(false),
      });

    try {
      const { filter, meta } = await schemaFilter.validateAsync(filterObject);
      const data = await readFile('users.json', 'utf8');
      const users = JSON.parse(data);
      let correctUsers = findUser(users, filter);
      if (meta.format === 'csv') {
        correctUsers = convertCsv(correctUsers);
      }
      if (meta.archive) {
        arhivator(correctUsers);
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
