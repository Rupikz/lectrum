const EventEmitter = require('events');

class Db extends EventEmitter {
  constructor() {
    super();
    this.storage = [];
    this.init();
  }

  save(chunk) {
    this.emit('save', chunk);
  }

  get() {
    this.emit('get');
  }

  init() {
    this.on('save', (chunk) => {
      const data = {
        source: chunk.meta.source,
        payload: chunk.payload,
        created: new Date(Date.now()),

      };
      this.storage.push(data);
    });

    this.on('get', () => {
      console.log(this.storage);
    });
  }
}

module.exports = Db;
