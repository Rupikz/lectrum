const fs = require('fs');
const os = require('os');
const zlib = require('zlib');
const Joi = require('joi');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);

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

const findUserByFilter = (file, filter) => {
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

  const headerCsvFile = `id;nameFirst;nameLast;phone;addressZip;addressCity;addressCountry;addressStreet;email;${os.EOL}`;
  let result = headerCsvFile;
  data.forEach((n) => {
    result += `${n.id};${n.name.first};${n.name.last};${n.phone};
    ${n.address.zip};${n.address.city};${n.address.country};${n.address.street};${n.email};${os.EOL}`;
  });

  return result;
};

const arhivator = (data, file) => {
  const gzip = zlib.createGzip(data);
  const write = fs.createWriteStream(file);
  gzip.pipe(write);
};

module.exports = {
  arhivator,
  convertCsv,
  findUserByFilter,
  schemaFilter,
  readFile,
};
