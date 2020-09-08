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

bank.on('add', (id, sum) => {
  if (!Object.prototype.hasOwnProperty.call(bank.agents, id)) return bank.emit('error', 'Контр агент не найден');
  if (sum <= 0) return bank.emit('error', 'Сумма должна быть больше нуля');
  bank.agents[id].balance += sum;
});

bank.on('get', (id, cb) => {
  if (!Object.prototype.hasOwnProperty.call(bank.agents, id)) return bank.emit('error', 'Контр агент не найден');
  const agent = bank.agents[id];
  cb(agent.balance);
});

bank.on('withdraw', (id, sum) => {
  if (!Object.prototype.hasOwnProperty.call(bank.agents, id)) return bank.emit('error', 'Контр агент не найден');
  if (sum <= 0) return bank.emit('error', 'Сумма должна быть больше нуля');
  if (bank.agents[id].balance - sum < 0) return bank.emit('error', 'Нельзя списать сумму больше чем на счете клиента');
  bank.agents[id].balance -= sum;
});

bank.on('error', (error) => {
  console.log(error);
});

bank.emit('add', personId, 20);

bank.emit('get', personId, (balance) => {
  console.log(`I have ${balance}₴`); // I have 120₴
});

bank.emit('withdraw', personId, 50);

bank.emit('get', personId, (balance) => {
  console.log(`I have ${balance}₴`); // I have 70₴
});
