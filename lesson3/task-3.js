const EventEmitter = require('events');

class Bank extends EventEmitter {
  constructor() {
    super();
    this.lastId = 0;
    this.agents = {};
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

bank.on('add', (id, amount) => {
  if (!Object.prototype.hasOwnProperty.call(bank.agents, id)) return bank.emit('error', 'Контр агент не найден');
  if (amount <= 0) return bank.emit('error', 'Сумма должна быть больше нуля');
  if (!bank.agents[id].limit(amount, bank.agents[id].balance, bank.agents[id].balance + amount)) return bank.emit('error', 'Ошибка лимита');
  bank.agents[id].balance += amount;
});

bank.on('get', (id, cb) => {
  if (!Object.prototype.hasOwnProperty.call(bank.agents, id)) return bank.emit('error', 'Контр агент не найден');
  const agent = bank.agents[id];
  cb(agent.balance);
});

bank.on('withdraw', (id, amount) => {
  if (!Object.prototype.hasOwnProperty.call(bank.agents, id)) return bank.emit('error', 'Контр агент не найден');
  if (amount <= 0) return bank.emit('error', 'Сумма должна быть больше нуля');
  if (bank.agents[id].balance - amount < 0) return bank.emit('error', 'Нельзя списать сумму больше чем на счете клиента');
  if (!bank.agents[id].limit(amount, bank.agents[id].balance, bank.agents[id].balance - amount)) return bank.emit('error', 'Ошибка лимита');
  bank.agents[id].balance -= amount;
});

bank.on('send', (firstId, secondId, amount) => {
  if (amount <= 0) return bank.emit('error', 'Сумма должна быть больше нуля');
  if (!Object.prototype.hasOwnProperty.call(bank.agents, firstId)
    || !Object.prototype.hasOwnProperty.call(bank.agents, secondId)) return bank.emit('error', 'Контр агент не найден');
  if (bank.agents[firstId].balance - amount < 0) return bank.emit('error', 'Нельзя перевести денег больше чем на счете');
  if (!bank.agents[firstId].limit(amount, bank.agents[firstId].balance, bank.agents[firstId].balance - amount)) return bank.emit('error', 'Ошибка лимита');
  bank.agents[firstId].balance -= amount;
  bank.agents[secondId].balance += amount;
});

bank.on('changeLimit', (id, cb) => {
  bank.agents[id].limit = cb;
});

bank.on('error', (error) => {
  console.log(error);
});

const personId = bank.register({
  name: 'Oliver White',
  balance: 801,
  limit: (amount) => amount < 10,
});

bank.emit('get', personId, (amount) => {
  console.log(`I have ${amount}₴`); // I have 695₴
});

// bank.emit('changeLimit', personId, (amount, currentBalance,
//   updatedBalance) => amount < 100 && updatedBalance > 700);
// bank.emit('withdraw', personId, 5);

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
