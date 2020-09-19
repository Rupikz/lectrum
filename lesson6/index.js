const path = require('path');
const Json2csv = require('./json2csv');
const Archiver = require('./Archiver');

const json2csv = new Json2csv(path.join(__dirname, './data/comments.json'), ['postId', 'name', 'body']);
json2csv.jsonParser();

const archiver = new Archiver(path.join(__dirname, './data/comments.csv.gz'));
archiver.archive();
// archiver.unarchive();
