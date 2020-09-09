const { Readable } = require('stream');

class Ui extends Readable { // Поставщик данных
  constructor(customers) {
    super({
      objectMode: true,
    });

    this.init();
    this.customers = customers;
  }

  init() {
    this.on('error', (error) => {
      console.log('Readable error: ', error);
    });
  }

  _read() {
    const data = this.customers.pop();

    if (data) {
      this.push(data);
    } else {
      this.push(null);
    }
  }
}

module.exports = Ui;
