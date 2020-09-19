const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const os = require('os');

const promisifyReadFile = promisify(fs.readFile);
const promisifyWriteFile = promisify(fs.writeFile);
const promisifyRename = promisify(fs.rename);

class json2csv {
  constructor(pathFile, settings) {
    this.pathFile = pathFile;
    this.settings = settings;
    this.data = `${settings.join(';')};${os.EOL}`;
  }

  dataParser(buffer) {
    const dataJSON = JSON.parse(buffer.toString());
    dataJSON.forEach((n) => {
      let stringLine = '';
      this.settings.forEach((column) => {
        stringLine += `${n[column]};`;
      });
      this.data += `${stringLine}${os.EOL}`;
    });
    return this.data;
  }

  async jsonParser() {
    try {
      const readFile = await promisifyReadFile(this.pathFile);
      const dataPars = this.dataParser(readFile);
      await promisifyWriteFile(this.pathFile, dataPars);
      await promisifyRename(this.pathFile, path.join(path.dirname(this.pathFile), `${path.basename(this.pathFile, '.json')}.csv`));
    } catch (err) {
      console.log(err);
    }
  }
}

module.exports = json2csv;
