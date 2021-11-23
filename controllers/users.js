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

module.exports.getAllUsers = async (req, res) => {
  let users;
  try {
    users = await User.find({});
    res.status(OK).send({ data: users });
  } catch (err) {
    res.status(INTERNAL_SERVER_ERROR).send({ message: `Произошла ошибка на сервере: ${err}.` });
  }
};

module.exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.userId ? req.params.userId : req.user._id;
    let user;
    try {
      user = await User.findById(userId);
    } catch (error) {
      if (error.name === 'CastError') {
        res.status(BAD_REQUEST).send({ message: 'Передан некорректный _id при поиске пользователя.' });
      } else {
        res.status(INTERNAL_SERVER_ERROR).send({ message: `Произошла ошибка на сервере: ${error}.` });
      }
      return;
    }

    if (!user) {
      res.status(NOT_FOUND).send({ message: 'Пользователь по указанному _id не найден.' });
      return;
    }

    res.send(user);
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR).send({ message: `Произошла ошибка на сервере: ${error}.` });
  }
};

module.exports.createUser = async (req, res) => {
  try {
    const {
      name,
      about,
      avatar,
      email,
      password,
    } = req.body;
    let hash;

    try {
      hash = await bcrypt.hash(password, 10);
    } catch (error) {
      res.status(INTERNAL_SERVER_ERROR).send({ message: `Произошла ошибка на сервере: ${error}.` });
      return;
    }

    try {
      await User.create({
        name,
        about,
        avatar,
        email,
        password: hash,
      });
    } catch (error) {
      if (error.name === 'ValidationError') {
        res.status(BAD_REQUEST).send({ message: 'Переданы некорректные данные при создании пользователя.' });
      } else {
        res.status(INTERNAL_SERVER_ERROR).send({ message: `Произошла ошибка на сервере: ${error}.` });
      }
      return;
    }

    res.status(OK).send({
      data: {
        name,
        about,
        avatar,
        email,
      },
    });
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR).send({ message: `Произошла ошибка на сервере: ${error}.` });
  }
};

module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user;

    try {
      user = await User.findOne({ email }).select('+password');
    } catch (error) {
      res.status(BAD_REQUEST).send({ message: 'Переданы некорректные данные при авторизации пользователя.' });
      return;
    }

    if (!user) {
      res.status(BAD_REQUEST).send({ message: 'Переданы некорректные данные при авторизации пользователя.' });
      return;
    }

    const isMatched = await bcrypt.compare(password, user.password);

    if (!isMatched) {
      res.status(BAD_REQUEST).send({ message: 'Переданы некорректные данные при авторизации пользователя.' });
      return;
    }

    const token = jwt.sign(
      { _id: user._id },
      NODE_ENV === 'production' ? JWT_SECRET : 'super-strong-secret',
      { expiresIn: '7d' },
    );

    await res.cookie('jwt', token, {
      maxAge: 3600000,
    });
    res.status(200).send('Авторизация прошла успешно');
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR).send({ message: `Произошла ошибка на сервере: ${error}.` });
  }
};

module.exports.updateProfile = async (req, res) => {
  try {
    const { name, about } = req.body;
    let user;

    try {
      user = await User.findByIdAndUpdate(
        req.user._id,
        {
          name,
          about,
        },
        {
          new: true,
          runValidators: true,
        },
      );
    } catch (error) {
      if (error.name === 'ValidationError' || error.name === 'CastError') {
        res.status(BAD_REQUEST).send({ message: 'Переданы некорректные данные при обновлении профиля.' });
      } else {
        res.status(INTERNAL_SERVER_ERROR).send({ message: `Произошла ошибка на сервере: ${error}.` });
      }
      return;
    }

    if (!user) {
      res.status(NOT_FOUND).send({ message: 'Пользователь с указанным _id не найден.' });
      return;
    }

    res.status(OK).send({ data: user });
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR).send({ message: `Произошла ошибка на сервере: ${error}.` });
  }
};

module.exports.updateAvatar = async (req, res) => {
  const { avatar } = req.body;
  let user;
  try {
    user = await User.findByIdAndUpdate(
      req.user._id,
      {
        avatar,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!user) {
      res.status(NOT_FOUND).send({ message: 'Пользователь с указанным _id не найден.' });
      return;
    }

    res.status(OK).send(user);
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(BAD_REQUEST).send({ message: 'Переданы некорректные данные при обновлении аватара.' });
    } else {
      res.status(INTERNAL_SERVER_ERROR).send({ message: `Произошла ошибка на сервере: ${error}.` });
    }
  }
};
