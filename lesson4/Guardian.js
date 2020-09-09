const { Transform } = require('stream');

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

  _transform(chunk, encoding, done) {
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
        email: Buffer.from(chunkObj.email, 'utf8').toString('hex'),
        password: Buffer.from(chunkObj.password, 'utf8').toString('hex'),
      },
    };
    this.push(customer);
    done();
  }
}

module.exports = Guardian;
