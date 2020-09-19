const { Writable } = require('stream');
const crypto = require('crypto');

class AccountManager extends Writable {
  constructor() {
    super({ objectMode: true });

    this.init();
    this.storage = [];
    this.password = 'sf55sfc5e';
    this.algorithm = 'aes192';
  }

  init() {
    this.on('error', (error) => {
      console.log('Writable error: ', error);
    });
  }

  _write(chunk, encoding, callback) {
    const customer = { ...chunk };
    const buf = Buffer.alloc(16);
    const iv = crypto.randomFillSync(buf, 10);
    const decipher = crypto.createDecipheriv(this.algorithm, this.password, null);
    let decrypted = decipher.update(chunk.payload.email, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    customer.payload.email = decrypted;

    console.log('write from source -->', chunk.payload || chunk);
    this.storage.push(chunk);
    callback();
  }
}

module.exports = AccountManager;
