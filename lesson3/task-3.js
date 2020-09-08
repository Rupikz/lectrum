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
    this._onSend();
    this._onChangeLimit();
  }

  _onAdd() {
    this.on('add', (id, amount) => {
      if (!Object.prototype.hasOwnProperty.call(this.agents, id)) return this.emit('error', 'Контр агент не найден');
      if (amount <= 0) return this.emit('error', 'Сумма должна быть больше нуля');
      if (!this.agents[id].limit(amount, this.agents[id].balance, this.agents[id].balance + amount)) return this.emit('error', 'Ошибка лимита');
      this.agents[id].balance += amount;
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
    this.on('withdraw', (id, amount) => {
      if (!Object.prototype.hasOwnProperty.call(this.agents, id)) return this.emit('error', 'Контр агент не найден');
      if (amount <= 0) return this.emit('error', 'Сумма должна быть больше нуля');
      if (this.agents[id].balance - amount < 0) return this.emit('error', 'Нельзя списать сумму больше чем на счете клиента');
      if (!this.agents[id].limit(amount, this.agents[id].balance, this.agents[id].balance - amount)) return this.emit('error', 'Ошибка лимита');
      this.agents[id].balance -= amount;
    });
  }

  _onSend() {
    this.on('send', (firstId, secondId, amount) => {
      if (amount <= 0) return this.emit('error', 'Сумма должна быть больше нуля');
      if (!Object.prototype.hasOwnProperty.call(this.agents, firstId)
        || !Object.prototype.hasOwnProperty.call(this.agents, secondId)) return this.emit('error', 'Контр агент не найден');
      if (this.agents[firstId].balance - amount < 0) return this.emit('error', 'Нельзя перевести денег больше чем на счете');
      if (!this.agents[firstId].limit(amount, this.agents[firstId].balance, this.agents[firstId].balance - amount)) return this.emit('error', 'Ошибка лимита');
      this.agents[firstId].balance -= amount;
      this.agents[secondId].balance += amount;
    });
  }

  _onChangeLimit() {
    this.on('changeLimit', (id, cb) => {
      this.agents[id].limit = cb;
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
    this.agents[id] = agent;
    return String(id);
  }
}

const bank = new Bank();

const personId = bank.register({
  name: 'Oliver White',
  balance: 800,
  limit: (amount) => amount < 10,
});

// bank.emit('withdraw', personId, 10);
// bank.emit('get', personId, (amount) => {
//   console.log(`I have ${amount}₴`); // I have 695₴
// });

bank.emit('changeLimit', personId, (amount, currentBalance,
  updatedBalance) => amount < 100 && updatedBalance > 700);
bank.emit('withdraw', personId, 5);

// bank.emit('changeLimit', personId, (amount, currentBalance,
//   updatedBalance) => amount < 100 && updatedBalance > 700 && currentBalance > 800);
// bank.emit('withdraw', personId, 5);

// bank.emit('changeLimit', personId, (amount, currentBalance) => currentBalance > 800);
// bank.emit('withdraw', personId, 5);

// bank.emit('changeLimit', personId, (amount, currentBalance,
//   updatedBalance) => updatedBalance > 900);
// bank.emit('add', personId, 99);
// bank.emit('get', personId, (amount) => {
//   console.log(`I have ${amount}₴`);
// });
