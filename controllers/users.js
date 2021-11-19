const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const {
  OK,
  BAD_REQUEST,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
} = require('../utils/constants');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports.getAllUsers = (req, res) => {
  User.find({})
    .then((data) => res.status(OK).send({ data }))
    .catch((err) => {
      res.status(INTERNAL_SERVER_ERROR).send({ message: `Произошла ошибка на сервере: ${err}.` });
    });
};

module.exports.getUserById = (req, res) => {
  User.findById(req.params.userId ? req.params.userId : req.user._id)
    .then((user) => {
      if (user) {
        res.status(OK).send({ data: user });
      } else {
        res.status(NOT_FOUND).send({ message: 'Пользователь по указанному _id не найден.' });
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(BAD_REQUEST).send({ message: 'Передан некорректный _id при поиске пользователя.' });
      } else {
        res.status(INTERNAL_SERVER_ERROR).send({ message: `Произошла ошибка на сервере: ${err}.` });
      }
    });
};

module.exports.createUser = (req, res) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => {
      User.create({
        name,
        about,
        avatar,
        email,
        password: hash,
      })
        .then(() => res.status(OK).send({
          data: {
            name,
            about,
            avatar,
            email,
          },
        }))
        .catch((err) => {
          if (err.name === 'ValidationError') {
            res.status(BAD_REQUEST).send({ message: 'Переданы некорректные данные при создании пользователя.' });
          } else {
            res.status(INTERNAL_SERVER_ERROR).send({ message: `Произошла ошибка на сервере: ${err}.` });
          }
        });
    });
};

module.exports.login = (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        res.status(BAD_REQUEST).send({ message: 'Переданы некорректные данные при авторизации пользователя.' });
      }
      return bcrypt.compare(password, user.password)
        .then((isMatched) => {
          if (!isMatched) {
            res.status(BAD_REQUEST).send({ message: 'Переданы некорректные данные при авторизации пользователя.' });
          }
          return user;
        });
    })
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'super-strong-secret', { expiresIn: '7d' });
      res
        .cookie('jwt', token, {
          maxAge: 3600000,
        })
        .end();
    });
};

module.exports.updateProfile = (req, res) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    {
      new: true,
      runValidators: true,
    },
    {
      name,
      about,
    },
  )
    .then((user) => {
      if (user) {
        res.status(OK).send({ data: user });
      } else {
        res.status(NOT_FOUND).send({ message: 'Пользователь с указанным _id не найден.' });
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(BAD_REQUEST).send({ message: 'Переданы некорректные данные при обновлении профиля.' });
      } else {
        res.status(INTERNAL_SERVER_ERROR).send({ message: `Произошла ошибка на сервере: ${err}.` });
      }
    });
};

module.exports.updateAvatar = (req, res) => {
  const { avatar } = req.body;

  return User.findByIdAndUpdate(
    req.user._id,
    {
      new: true,
      runValidators: true,
    },
    {
      avatar,
    },
  )
    .then((user) => {
      if (user) {
        res.status(OK).send(user);
      } else {
        res.status(NOT_FOUND).send({ message: 'Пользователь с указанным _id не найден.' });
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(BAD_REQUEST).send({ message: 'Переданы некорректные данные при обновлении аватара.' });
      } else {
        res.status(INTERNAL_SERVER_ERROR).send({ message: `Произошла ошибка на сервере: ${err}.` });
      }
    });
};
