const EventEmitter = require('events');

class Bank extends EventEmitter {
  constructor() {
    super();
    this.lastId = 0;
    this.agents = {};
    this._onAdd();
    this._onGet();
    this._onWithdraw();
    this._onError();
  }

  _onAdd() {
    this.on('add', (id, sum) => {
      if (!Object.prototype.hasOwnProperty.call(this.agents, id)) return this.emit('error', 'Контр агент не найден');
      if (sum <= 0) return this.emit('error', 'Сумма должна быть больше нуля');
      this.agents[id].balance += sum;
    });
  }

  _onGet() {
    this.on('get', (id, cb) => {
      if (!Object.prototype.hasOwnProperty.call(this.agents, id)) return this.emit('error', 'Контр агент не найден');
      const agent = this.agents[id];
      cb(agent.balance);
    });
  }

  _onWithdraw() {
    this.on('withdraw', (id, sum) => {
      if (!Object.prototype.hasOwnProperty.call(this.agents, id)) return this.emit('error', 'Контр агент не найден');
      if (sum <= 0) return this.emit('error', 'Сумма должна быть больше нуля');
      if (this.agents[id].balance - sum < 0) return this.emit('error', 'Нельзя списать сумму больше чем на счете клиента');
      this.agents[id].balance -= sum;
    });
  }

  _onError() {
    this.on('error', (error) => {
      console.log(error);
    });
  }

  _newId() {
    this.lastId += 1;
    return this.lastId;
  }

  register(agent) {
    if (agent.balance <= 0) throw new Error('Неверный начальный баланс');
    const id = this._newId();
    this.agents[id] = {
      name: agent.name,
      balance: agent.balance,
    };
    return String(id);
  }
}

const bank = new Bank();
const personId = bank.register({
  name: 'Pitter Black',
  balance: 100,
});

bank.emit('add', personId, 20);

bank.emit('get', personId, (balance) => {
  console.log(`I have ${balance}₴`); // I have 120₴
});

bank.emit('withdraw', personId, 50);

bank.emit('get', personId, (balance) => {
  console.log(`I have ${balance}₴`); // I have 70₴
});
