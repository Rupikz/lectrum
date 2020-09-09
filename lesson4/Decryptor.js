const { Transform } = require('stream');

const check = (field, algorithm) => {
  if (algorithm !== 'hex' && algorithm !== 'base64') {
    throw new Error('Выбран неизвестный алгоритм');
  }

  return Buffer.from(field, algorithm).toString('utf8');
};

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
      throw new Error('Неверная структура алгоритма');
    }
    const customer = {
      name: payload.name,
      email: check(payload.email, meta.algorithm),
      password: check(payload.password, meta.algorithm),
    };
    this.push(customer);
    callback();
  }
}

module.exports = Decryptor;
