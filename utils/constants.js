const OK = 200;

const urlServer = 'mongodb://localhost:27017/mestodb';

const allowedCors = [
  'https://mesto-project.nomoredomains.rocks',
  'http://mesto-project.nomoredomains.rocks',
  'localhost:3000',
];
const DEFAULT_ALLOWED_METHODS = 'GET,HEAD,PUT,PATCH,POST,DELETE';

module.exports = {
  OK,
  urlServer,
  allowedCors,
  DEFAULT_ALLOWED_METHODS,
};
