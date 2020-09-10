const { Writable } = require('stream');

class AccountManager extends Writable { // Хранилище данных
  constructor() {
    super({ objectMode: true });

    this.init();
    this.storage = [];
  }

  init() {
    this.on('error', (error) => {
      console.log('Writable error: ', error);
    });
  }

  _write(chunk, encoding, callback) {
    console.log('write from source -->', chunk.payload || chunk);
    this.storage.push(chunk);
    callback();
  }
}

module.exports = AccountManager;
