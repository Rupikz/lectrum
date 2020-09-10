const { Transform } = require('stream');
const { decryptor } = require('./helpers');

class Decryptor extends Transform {
  constructor() {
    super({ objectMode: true });
    this.init();
  }

  init() {
    this.on('error', (error) => {
      console.log('Transform error: ', error);
    });
  }

  _transform(chunk, encoding, callback) {
    const { payload, meta } = chunk;
    if (!payload || !meta || !meta.algorithm
          || !payload.name || !payload.email || !payload.password) {
      throw new Error('Неверная структура объекта');
    }
    const customer = {
      name: payload.name,
      email: decryptor(payload.email, meta.algorithm),
      password: decryptor(payload.password, meta.algorithm),
    };
    this.push(customer);
    callback();
  }
}

module.exports = Decryptor;
