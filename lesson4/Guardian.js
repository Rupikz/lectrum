const { Transform } = require('stream');
const { cryptor } = require('./helpers');

class Guardian extends Transform { // Шифрование
  constructor() {
    super({
      readableObjectMode: true,
      decodeStrings: false,
      objectMode: true,
    });

    this.init();
  }

  init() {
    this.on('error', (error) => {
      console.log('Transform error: ', error);
    });
  }

  _transform(chunk, encoding, callback) {
    const chunkObj = chunk;
    if (!chunkObj.name) throw new Error('Name не указан');
    if (!chunkObj.email) throw new Error('Email не указан');
    if (!chunkObj.password) throw new Error('Password не указан');
    const customer = {
      meta: {
        source: 'ui',
      },
      payload: {
        name: chunkObj.name,
        email: cryptor(chunkObj.email),
        password: cryptor(chunkObj.password),
      },
    };
    this.push(customer);
    callback();
  }
}

module.exports = Guardian;
