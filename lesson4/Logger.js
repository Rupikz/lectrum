const { Transform } = require('stream');
const Db = require('./Db');

class Logger extends Transform {
  constructor() {
    super({ objectMode: true });
    this.db = new Db();
    this.init();
  }

  init() {
    this.on('error', (error) => {
      console.log('Transform error: ', error);
    });
  }

  _transform(chunk, encoding, callback) {
    this.db.emit('save', chunk);
    this.push(chunk);
    callback();
  }

  _flush(callback) {
    this.db.emit('get');
    callback();
  }
}

module.exports = Logger;
