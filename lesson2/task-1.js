class TimersManager {
  constructor() {
    this.timers = [];
    this.workTimers = {};
    this.included = false;
    this.log = [];
  }

  add(obj, ...arg) {
    if (!obj.name || typeof obj.name !== 'string') throw new Error('Поле name содержит неверный тип');
    if (!obj.delay || typeof obj.delay !== 'number') throw new Error('Поле delay содержит неверный тип');
    if (obj.delay < 0 || obj.delay > 5000) throw new Error('Неверно заданное время');
    if (obj.interval === undefined || typeof obj.interval !== 'boolean') throw new Error('Поле interval содержит неверный тип');
    if (!obj.job || typeof obj.job !== 'function') throw new Error('Поле job содержит неверный тип');
    if (this.included) throw new Error('Таймер уже запущен');

    this.timers.forEach((n) => {
      if (n.name === obj.name) throw new Error('Такое имя уже существует');
    });

    this.timers.push({
      timer: obj,
      arg,
    });

    return this;
  }

  remove(name) {
    this.pause(name);
    for (let i = 0; i < this.timers.length; i += 1) {
      if (this.timers[i].timer.name === name) {
        this.timers.splice(i, 1);
        break;
      }
    }
  }

  start() {
    this.included = true;
    this.timers.forEach((n) => {
      if (n.timer.interval) {
        this.workTimers[n.timer.name] = setInterval(n.timer.job, n.timer.delay, ...n.arg);
      } else {
        this.workTimers[n.timer.name] = setTimeout(n.timer.job, n.timer.delay, ...n.arg);
      }
    });
  }

  stop() {
    this.included = false;
    Object.keys(this.workTimers).forEach((n) => {
      this.pause(n);
    });
  }

  pause(name) {
    clearInterval(this.workTimers[name]);
  }

  resume(name) {
    this.timers.forEach((n) => {
      if (n.timer.name === name) {
        if (n.timer.interval) {
          this.workTimers[n.timer.name] = setInterval(n.timer.job, n.timer.delay, ...n.arg);
        } else {
          this.workTimers[n.timer.name] = setTimeout(n.timer.job, n.timer.delay, ...n.arg);
        }
      }
    });
  }
}

const manager = new TimersManager();

const t1 = {
  name: 't1',
  delay: 1000,
  interval: true,
  job: () => { console.log('t1'); },
};

const t2 = {
  name: 't2',
  delay: 1000,
  interval: false,
  job: (a, b) => a + b,
};

manager.add(t1).add(t2, 1, 2);
manager.start();
// manager.stop();

// manager.remove('t1');

console.log(1);
// manager.pause('t1');
