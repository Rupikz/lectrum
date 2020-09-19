const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

class Archiver {
  constructor(options) {
    this.options = options;
  }

  _getArchiveMethod() {
    switch (this.options.algorithm) {
      case 'gzip':
        return zlib.createGzip();
      default:
        return zlib.createDeflate();
    }
  }

  _getExtractMethod() {
    switch (this.options.algorithm) {
      case 'gzip':
        return zlib.createGunzip();
      default:
        return zlib.createInflate();
    }
  }

  archive() {
    const gzip = this._getArchiveMethod();
    const read = fs.createReadStream(this.path);
    const write = fs.createWriteStream(`${this.path}.gz`);
    read.pipe(gzip).pipe(write);
  }

  unarchive() {
    const unArch = this._getExtractMethod();
    const fileReadableStream = fs.createReadStream(this.path);
    const fileWritableStream = fs.createWriteStream(path.join(path.dirname(this.path), `${path.basename(this.path, '.csv')}.json`));
    fileReadableStream.pipe(unArch).pipe(fileWritableStream);
  }
}

module.exports = Archiver;
