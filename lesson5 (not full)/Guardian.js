const { Transform } = require('stream');
const crypto = require('crypto');

class Guardian extends Transform {
  constructor() {
    super({
      readableObjectMode: true,
      decodeStrings: false,
      objectMode: true,
    });

    this.init();
    this.password = 'sf55sfc5e';
    this.algorithm = 'aes192';
  }

  init() {
    this.on('error', (error) => {
      console.log('Transform error: ', error);
    });
  }

  cryptor(data) {
    // crypto.scrypt(this.password, 'salt', 24, (err, derivedKey) => {
    //   if (err) throw err;
    //   const buffer = Buffer.alloc(16);
    //   crypto.randomFill(buffer, 10, (err1, iv) => {
    //     if (err1) throw err;
    //     const cipher = crypto.createCipheriv(this.algorithm, derivedKey, iv);
    //     let encrypted = cipher.update(
    //       data, 'utf8', 'hex',
    //     );
    //     encrypted += cipher.final('hex');
    //     return encrypted;
    //   });
    // });

    const key = crypto.scryptSync(this.password, 'salt', 24);
    const buf = Buffer.alloc(16);
    const iv = crypto.randomFillSync(buf, 10);
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);

    let encrypted = cipher.update(
      data,
      'utf8',
      'hex',
    );
    encrypted += cipher.final('hex');

    return encrypted;
  }

  async _transform(chunk, encoding, callback) {
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
        email: this.cryptor(chunkObj.email),
        password: this.cryptor(chunkObj.password),
      },
    };

    this.push(customer);
    callback();
  }
}

module.exports = Guardian;
