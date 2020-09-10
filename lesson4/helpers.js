exports.decryptor = (field, algorithm) => {
  if (algorithm !== 'hex' && algorithm !== 'base64') {
    throw new Error('Выбран неизвестный алгоритм');
  }

  return Buffer.from(field, algorithm).toString('utf8');
};

exports.cryptor = (data) => Buffer.from(data, 'utf8').toString('hex');
