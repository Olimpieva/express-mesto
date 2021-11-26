const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/unauthorized-error');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    let payload;
    try {
      payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'super-strong-secret');
    } catch (error) {
      next(new UnauthorizedError('Переданы некорректные данные при авторизации пользователя.'));
    }
    req.user = payload;
    next();
  } else {
    next(new UnauthorizedError('Необходима авторизация.'));
  }
};
