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
      this._log(n.timer, n.arg);
      let promise;
      if (n.timer.interval) {
        promise = new Promise((resolve) => {
          setInterval(resolve(n.timer.job), n.timer.delay, ...n.arg);
        });
      } else {
        promise = new Promise((resolve) => {
          setTimeout(resolve(n.timer.job), n.timer.delay, ...n.arg);
        });
      }

      promise.then(
        (result) => {
          this.workTimers[n.timer.name] = result;
        },
        (error) => console.log(error),
      );
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
        this._log(n.timer, n.arg);
        if (n.timer.interval) {
          this.workTimers[n.timer.name] = setInterval(n.timer.job, n.timer.delay, ...n.arg);
        } else {
          this.workTimers[n.timer.name] = setTimeout(n.timer.job, n.timer.delay, ...n.arg);
        }
      }
    });
  }

  _log(timer, arg) {
    const log = {
      name: timer.name,
      in: arg,
      out: undefined,
      created: new Date(Date.now()),
    };
    try {
      log.out = timer.job(...arg);
    } catch (err) {
      log.error = {
        name: err.name,
        message: err.message,
        stack: err.stack,
      };
    }

    this.log.push(log);
  }

  print() {
    console.log(this.log);
  }
}

const manager = new TimersManager();

const t1 = {
  name: 't1',
  delay: 1000,
  interval: false,
  job: (a, b) => a + b,
};

const t2 = {
  name: 't2',
  delay: 1000,
  interval: false,
  job: () => {
    throw new Error('We have a problem!');
  },
};

const t3 = {
  name: 't3',
  delay: 1000,
  interval: false,
  job: (n) => n,
};

manager.add(t1, 1, 2);
manager.add(t2);
manager.add(t3, 1); // 1
manager.start();

setTimeout(() => {
  manager.print();
}, 2000);
